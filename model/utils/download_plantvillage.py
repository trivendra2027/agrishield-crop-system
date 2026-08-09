"""
PlantVillage Complete Dataset Downloader & Integrator
Downloads all missing PlantVillage versions (Segmented, updated Color/Grayscale)
from Kaggle, verifies, deduplicates, and merges into combined_dataset.

Existing inventory:
  - Color: 116,124 files (PRESENT)
  - Grayscale: 54,305 files (PRESENT)
  - Segmented: MISSING
"""
import os
import sys
import json
import time
import hashlib
import logging
import shutil
from PIL import Image

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from model.configs.config import PipelineConfig

logger = logging.getLogger("PlantVillage_Downloader")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

WORKSPACE = PipelineConfig.WORKSPACE_ROOT
PROGRESS_LOG = os.path.join(WORKSPACE, "dataset_download_progress.log")
PV_DIR = os.path.join(WORKSPACE, "datasets", "PlantVillage")
COMBINED_DIR = PipelineConfig.COMBINED_DIR
REPORTS_DIR = PipelineConfig.REPORTS_DIR
CLASSES_PATH = PipelineConfig.CLASSES_PATH
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.bmp'}

# Kaggle refs for PlantVillage (comprehensive versions with color/grayscale/segmented)
KAGGLE_REFS = [
    "arjuntejaswi/plant-village",
    "abdallahalidev/plantvillage-dataset",
    "siddhantsadangi/plantvillage-dataset",
    "emmarex/plantdisease",
]


def log(msg):
    ts = time.strftime("[%Y-%m-%d %H:%M:%S]")
    line = f"{ts} {msg}\n"
    with open(PROGRESS_LOG, "a", encoding="utf-8") as f:
        f.write(line)
    logger.info(msg)


def md5(path):
    h = hashlib.md5()
    try:
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return None


def verify_image(path):
    try:
        with Image.open(path) as img:
            img.verify()
        return True
    except Exception:
        return False


def download_plantvillage():
    """Download PlantVillage from Kaggle — try multiple refs."""
    os.environ["KAGGLE_API_TOKEN"] = "KGAT_6ea2a3aeb5eee64adbe96cd1e551e708"
    import kagglehub

    for ref in KAGGLE_REFS:
        log(f"Trying kagglehub.dataset_download('{ref}')...")
        try:
            dl_path = kagglehub.dataset_download(ref)
            log(f"SUCCESS — downloaded to: {dl_path}")
            return dl_path
        except Exception as e:
            log(f"  Failed ({ref}): {e}")
    return None


def find_version_dirs(dl_root):
    """Find color/grayscale/segmented directories in the download."""
    versions = {}
    for root, dirs, files in os.walk(dl_root):
        for d in dirs:
            dl = d.lower()
            if dl in ('color', 'colour'):
                versions['color'] = os.path.join(root, d)
            elif dl == 'grayscale':
                versions['grayscale'] = os.path.join(root, d)
            elif dl == 'segmented':
                versions['segmented'] = os.path.join(root, d)
    return versions


def integrate(dl_root):
    """
    Find segmented + any new color/grayscale images not already present.
    Verify, deduplicate, merge into PlantVillage storage + combined_dataset.
    """
    os.makedirs(COMBINED_DIR, exist_ok=True)

    # Check what versions exist in existing PlantVillage
    existing_color = os.path.exists(os.path.join(PV_DIR, "color"))
    existing_gray = os.path.exists(os.path.join(PV_DIR, "grayscale"))
    existing_seg = os.path.exists(os.path.join(PV_DIR, "segmented"))

    log(f"Existing PlantVillage versions: color={existing_color}, grayscale={existing_gray}, segmented={existing_seg}")

    # Find versions in download
    versions = find_version_dirs(dl_root)
    log(f"Found versions in download: {list(versions.keys())}")

    if not versions:
        # Maybe the download is organized differently — treat entire directory as color
        log("No version subdirs found. Scanning for class folders directly...")
        versions['color'] = dl_root

    # Pre-hash existing combined images for dedup
    seen = set()
    log("Pre-hashing existing combined_dataset images for dedup...")
    hash_count = 0
    hash_start = time.time()
    for root, _, files in os.walk(COMBINED_DIR):
        for f in files:
            if os.path.splitext(f)[1].lower() in VALID_EXTS:
                h = md5(os.path.join(root, f))
                if h:
                    seen.add(h)
                hash_count += 1
                if hash_count % 10000 == 0:
                    log(f"  Pre-hashed {hash_count:,} images so far...")
    log(f"Pre-hashed {len(seen):,} existing images in {round(time.time()-hash_start)}s.")

    # Load current classes
    existing_classes = []
    if os.path.exists(CLASSES_PATH):
        with open(CLASSES_PATH) as fp:
            existing_classes = json.load(fp)
    existing_set = set(existing_classes)

    new_classes_added = []
    total_added = 0
    total_corrupt = 0
    total_dup = 0
    total_skipped_existing = 0
    version_stats = {}
    start = time.time()
    last_report = start

    for version_name, version_path in versions.items():
        log(f"\n--- Processing version: {version_name} ---")

        # For color and grayscale — only process if NEW images might be present
        # For segmented — always process (it's missing)
        pv_version_dir = os.path.join(PV_DIR, version_name)
        os.makedirs(pv_version_dir, exist_ok=True)

        # Find class folders in this version
        class_dirs = []
        for root, dirs, files in os.walk(version_path):
            img_files = [f for f in files if os.path.splitext(f)[1].lower() in VALID_EXTS]
            if img_files:
                class_dirs.append((root, img_files))

        total_cls = len(class_dirs)
        log(f"  Found {total_cls} class folders in {version_name}")

        ver_added = 0
        ver_corrupt = 0
        ver_dup = 0
        cls_processed = 0

        for cls_root, img_files in class_dirs:
            cls_name = os.path.basename(cls_root).replace(" ", "_")
            cls_processed += 1

            # For segmented version, suffix class name
            if version_name == "segmented":
                combined_cls_name = cls_name  # merge into same class in combined
            else:
                combined_cls_name = cls_name

            pv_cls = os.path.join(pv_version_dir, cls_name)
            combined_cls = os.path.join(COMBINED_DIR, combined_cls_name)
            os.makedirs(pv_cls, exist_ok=True)
            os.makedirs(combined_cls, exist_ok=True)

            if combined_cls_name not in existing_set:
                new_classes_added.append(combined_cls_name)
                existing_classes.append(combined_cls_name)
                existing_set.add(combined_cls_name)

            for fname in img_files:
                src = os.path.join(cls_root, fname)
                if not verify_image(src):
                    ver_corrupt += 1
                    total_corrupt += 1
                    continue
                h = md5(src)
                if h and h in seen:
                    ver_dup += 1
                    total_dup += 1
                    continue
                if h:
                    seen.add(h)

                # Save to PlantVillage version dir
                dst_pv = os.path.join(pv_cls, fname)
                if not os.path.exists(dst_pv):
                    shutil.copy2(src, dst_pv)

                # Save to combined dataset
                dst_cb = os.path.join(combined_cls, fname)
                if not os.path.exists(dst_cb):
                    shutil.copy2(src, dst_cb)

                ver_added += 1
                total_added += 1

            # Progress every 2 min
            now = time.time()
            if now - last_report >= 120:
                pct = round(cls_processed / max(1, total_cls) * 100, 1)
                elapsed = round((now - start) / 60, 1)
                log(f"\n{'='*60}\n"
                    f"PLANTVILLAGE PROGRESS — {version_name}\n"
                    f"{'='*60}\n"
                    f"• Version progress: {pct}% ({cls_processed}/{total_cls})\n"
                    f"• New images this version: {ver_added:,}\n"
                    f"• Total new images overall: {total_added:,}\n"
                    f"• Corrupted: {total_corrupt}\n"
                    f"• Duplicates skipped: {total_dup}\n"
                    f"• Elapsed: {elapsed} min\n"
                    f"{'='*60}\n")
                last_report = now

        version_stats[version_name] = {
            "classes": total_cls,
            "new_images": ver_added,
            "corrupted": ver_corrupt,
            "duplicates": ver_dup,
        }
        log(f"  {version_name} complete: {ver_added:,} new images, {ver_dup:,} dups, {ver_corrupt} corrupt")

    return new_classes_added, total_added, total_corrupt, total_dup, version_stats


def get_dir_size(path):
    total = 0
    for root, _, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            if os.path.isfile(fp):
                total += os.path.getsize(fp)
    return total


def update_reports(new_classes, images_added, version_stats):
    os.makedirs(REPORTS_DIR, exist_ok=True)

    all_classes = []
    if os.path.exists(CLASSES_PATH):
        with open(CLASSES_PATH) as fp:
            all_classes = json.load(fp)

    class_counts = {}
    total_images = 0
    for cls in sorted(os.listdir(COMBINED_DIR)):
        p = os.path.join(COMBINED_DIR, cls)
        if os.path.isdir(p) and cls != "folds":
            n = len([f for f in os.listdir(p) if os.path.splitext(f)[1].lower() in VALID_EXTS])
            class_counts[cls] = n
            total_images += n

    active = [c for c, n in class_counts.items() if n > 0]
    missing = [c for c in all_classes if class_counts.get(c, 0) == 0]
    completeness = round(len(active) / max(1, len(all_classes)) * 100, 1)

    with open(os.path.join(REPORTS_DIR, "dataset_inventory.json"), "w") as fp:
        json.dump({"total_ontology_classes": len(all_classes), "completed_classes": len(active),
                    "missing_classes_count": len(missing), "total_images_retained": total_images,
                    "completeness_score_pct": completeness}, fp, indent=2)

    with open(os.path.join(REPORTS_DIR, "dataset_statistics.json"), "w") as fp:
        json.dump({"total_classes": len(active), "total_images": total_images,
                    "empty_classes": len(missing),
                    "plantvillage_version_stats": version_stats,
                    "new_images_from_plantvillage_update": images_added}, fp, indent=2)

    sources_path = os.path.join(REPORTS_DIR, "dataset_sources.json")
    sources = {"sources": []}
    if os.path.exists(sources_path):
        with open(sources_path) as fp:
            sources = json.load(fp)
    # Update existing PlantVillage entry or add new
    pv_found = False
    for s in sources["sources"]:
        if isinstance(s, dict) and "PlantVillage" in s.get("name", ""):
            s["versions"] = list(version_stats.keys())
            s["status"] = "All Versions Active & Verified"
            pv_found = True
            break
    if not pv_found:
        sources["sources"].append({"name": "PlantVillage Dataset (All Versions)",
                                    "type": "Kaggle / Academic",
                                    "versions": list(version_stats.keys()),
                                    "status": "All Versions Active & Verified"})
    with open(sources_path, "w") as fp:
        json.dump(sources, fp, indent=2)

    with open(os.path.join(REPORTS_DIR, "missing_classes.json"), "w") as fp:
        json.dump(missing, fp, indent=2)

    with open(CLASSES_PATH, "w") as fp:
        json.dump(sorted(set(all_classes)), fp, indent=2)

    return total_images, len(active), completeness


def main():
    log("=" * 70)
    log("PLANTVILLAGE COMPLETE DATASET DOWNLOAD & INTEGRATION — START")
    log("=" * 70)
    log("Existing: color (116,124 files), grayscale (54,305 files)")
    log("Missing: segmented version")
    t0 = time.time()

    # 1. Download
    dl_path = download_plantvillage()
    if not dl_path or not os.path.exists(dl_path):
        log("ERROR: Could not download PlantVillage from any source. Aborting.")
        return

    # 2. Integrate
    new_classes, added, corrupt, dups, version_stats = integrate(dl_path)

    # 3. Storage
    pv_size = get_dir_size(PV_DIR)
    pv_size_gb = round(pv_size / (1024**3), 2)

    # 4. Update reports
    total_imgs, total_cls, completeness = update_reports(new_classes, added, version_stats)

    elapsed = round((time.time() - t0) / 60, 1)

    summary = (
        f"\n{'='*70}\n"
        f"PLANTVILLAGE INTEGRATION — COMPLETE\n"
        f"{'='*70}\n"
    )
    for vname, vstats in version_stats.items():
        summary += (f"  {vname}: {vstats['new_images']:,} new images, "
                     f"{vstats['duplicates']:,} dups, {vstats['corrupted']} corrupt\n")
    summary += (
        f"\n• Total new images added:              {added:,}\n"
        f"• New classes added:                   {len(new_classes)}\n"
        f"• Corrupted images removed:            {corrupt}\n"
        f"• Duplicate images skipped:            {dups}\n"
        f"• PlantVillage total storage:          {pv_size_gb} GB\n"
        f"• Updated total images in dataset:     {total_imgs:,}\n"
        f"• Updated total active classes:        {total_cls}\n"
        f"• Dataset completeness:                {completeness}%\n"
        f"• Elapsed time:                        {elapsed} min\n"
        f"{'='*70}\n"
    )
    if new_classes:
        summary += "\nNew classes added:\n"
        for i, c in enumerate(new_classes, 1):
            summary += f"  {i}. {c}\n"
    log(summary)


if __name__ == "__main__":
    main()
