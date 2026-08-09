"""
Plant Seedlings Dataset Downloader & Integrator
Downloads the V2 Plant Seedlings Dataset (12 weed/crop seedling classes)
from Kaggle, verifies, deduplicates, and merges into combined_dataset.
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

logger = logging.getLogger("Seedlings_Downloader")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

WORKSPACE = PipelineConfig.WORKSPACE_ROOT
PROGRESS_LOG = os.path.join(WORKSPACE, "dataset_download_progress.log")
SEEDLINGS_DIR = os.path.join(WORKSPACE, "datasets", "PlantSeedlings")
COMBINED_DIR = PipelineConfig.COMBINED_DIR
REPORTS_DIR = PipelineConfig.REPORTS_DIR
CLASSES_PATH = PipelineConfig.CLASSES_PATH
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}

KAGGLE_REFS = [
    "vbookshelf/v2-plant-seedlings-dataset",
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


def download_seedlings():
    """Download Plant Seedlings dataset from Kaggle."""
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


def integrate(dl_root):
    """
    Find class-organized subdirectories. Verify, deduplicate, merge.
    """
    os.makedirs(COMBINED_DIR, exist_ok=True)

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
    start = time.time()
    last_report = start

    # Find class folders
    class_dirs = []
    for root, dirs, files in os.walk(dl_root):
        img_files = [f for f in files if os.path.splitext(f)[1].lower() in VALID_EXTS]
        if img_files and len(img_files) >= 5:
            class_dirs.append((root, img_files))

    total_cls = len(class_dirs)
    log(f"Found {total_cls} image-containing folders.")

    cls_processed = 0
    for cls_root, img_files in class_dirs:
        cls_processed += 1
        folder_name = os.path.basename(cls_root)
        
        # Format class name (e.g., "Black-grass" -> "Black_grass_Seedling")
        base_name = folder_name.replace(" ", "_").replace("-", "_")
        cls_name = f"{base_name}_Seedling"

        seedlings_cls = os.path.join(SEEDLINGS_DIR, cls_name)
        combined_cls = os.path.join(COMBINED_DIR, cls_name)
        os.makedirs(seedlings_cls, exist_ok=True)
        os.makedirs(combined_cls, exist_ok=True)

        if cls_name not in existing_set:
            new_classes_added.append(cls_name)
            existing_classes.append(cls_name)
            existing_set.add(cls_name)

        cls_added = 0
        for fname in img_files:
            src = os.path.join(cls_root, fname)
            if not verify_image(src):
                total_corrupt += 1
                continue
            h = md5(src)
            if h and h in seen:
                total_dup += 1
                continue
            if h:
                seen.add(h)

            dst_seedlings = os.path.join(seedlings_cls, fname)
            dst_cb = os.path.join(combined_cls, fname)
            if not os.path.exists(dst_seedlings):
                shutil.copy2(src, dst_seedlings)
            if not os.path.exists(dst_cb):
                shutil.copy2(src, dst_cb)
            cls_added += 1
            total_added += 1

        now = time.time()
        if now - last_report >= 120 or cls_processed == total_cls:
            pct = round(cls_processed / max(1, total_cls) * 100, 1)
            elapsed = round((now - start) / 60, 1)
            log(f"\n{'='*60}\n"
                f"PLANT SEEDLINGS PROGRESS\n"
                f"{'='*60}\n"
                f"• Progress: {pct}% ({cls_processed}/{total_cls})\n"
                f"• Images verified: {total_added:,}\n"
                f"• Corrupted: {total_corrupt}\n"
                f"• Duplicates: {total_dup}\n"
                f"• Latest: {cls_name} (+{cls_added})\n"
                f"• Elapsed: {elapsed} min\n"
                f"{'='*60}\n")
            last_report = now

    return new_classes_added, total_added, total_corrupt, total_dup


def update_reports(new_classes, images_added):
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
                    "empty_classes": len(missing), "new_from_seedlings": len(new_classes),
                    "images_from_seedlings": images_added}, fp, indent=2)

    sources_path = os.path.join(REPORTS_DIR, "dataset_sources.json")
    sources = {"sources": []}
    if os.path.exists(sources_path):
        with open(sources_path) as fp:
            sources = json.load(fp)
    if not any("Seedlings" in (s.get("name", s) if isinstance(s, dict) else s) for s in sources["sources"]):
        sources["sources"].append({"name": "Plant Seedlings Dataset", "type": "Kaggle",
                                    "classes": 12, "images": images_added, "status": "Active & Verified"})
    with open(sources_path, "w") as fp:
        json.dump(sources, fp, indent=2)

    with open(os.path.join(REPORTS_DIR, "missing_classes.json"), "w") as fp:
        json.dump(missing, fp, indent=2)
    with open(CLASSES_PATH, "w") as fp:
        json.dump(sorted(set(all_classes)), fp, indent=2)
    return total_images, len(active), completeness


def main():
    log("=" * 70)
    log("PLANT SEEDLINGS DATASET DOWNLOAD & INTEGRATION — START")
    log("=" * 70)
    t0 = time.time()
    os.makedirs(SEEDLINGS_DIR, exist_ok=True)

    dl_path = download_seedlings()
    if not dl_path:
        log("ERROR: Could not download Plant Seedlings dataset. Aborting.")
        return

    new_classes, added, corrupt, dups = integrate(dl_path)

    size_bytes = sum(os.path.getsize(os.path.join(root, f)) for root, _, files in os.walk(SEEDLINGS_DIR) for f in files)
    size_gb = round(size_bytes / (1024**3), 2)
    total_imgs, total_cls, completeness = update_reports(new_classes, added)
    elapsed = round((time.time() - t0) / 60, 1)

    summary = (
        f"\n{'='*70}\n"
        f"PLANT SEEDLINGS INTEGRATION — COMPLETE\n"
        f"{'='*70}\n"
        f"• New classes added:                   {len(new_classes)}\n"
        f"• Total images downloaded & verified:  {added:,}\n"
        f"• Corrupted images removed:            {corrupt}\n"
        f"• Duplicate images skipped:            {dups}\n"
        f"• Seedlings storage used:              {size_gb} GB\n"
        f"• Storage location:                    datasets/PlantSeedlings/\n"
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
