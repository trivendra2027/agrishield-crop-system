"""
DeepWeeds Dataset Downloader & Integrator
Downloads the complete DeepWeeds dataset (17,509 images, 9 classes)
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

logger = logging.getLogger("DeepWeeds_Downloader")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

WORKSPACE = PipelineConfig.WORKSPACE_ROOT
PROGRESS_LOG = os.path.join(WORKSPACE, "dataset_download_progress.log")
DEEPWEEDS_DIR = os.path.join(WORKSPACE, "datasets", "DeepWeeds")
COMBINED_DIR = PipelineConfig.COMBINED_DIR
REPORTS_DIR = PipelineConfig.REPORTS_DIR
CLASSES_PATH = PipelineConfig.CLASSES_PATH
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}

# DeepWeeds class mapping (label_id -> readable name)
DEEPWEEDS_CLASSES = {
    0: "Chinee_Apple_Weed",
    1: "Snake_Weed",
    2: "Lantana_Weed",
    3: "Prickly_Acacia_Weed",
    4: "Siam_Weed",
    5: "Parthenium_Weed",
    6: "Rubber_Vine_Weed",
    7: "Parkinsonia_Weed",
    8: "Negative_Weed_Other",
}

KAGGLE_REFS = [
    "imsparsh/deepweeds",
    "coreylammie/deepweedsx",
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


def download_deepweeds():
    """Download DeepWeeds from Kaggle using kagglehub."""
    os.makedirs(DEEPWEEDS_DIR, exist_ok=True)
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


def find_labels_csv(dl_root):
    """Find the labels CSV file in the download directory."""
    import csv
    for root, _, files in os.walk(dl_root):
        for f in files:
            if f.endswith('.csv') and 'label' in f.lower():
                return os.path.join(root, f)
    # Try any CSV
    for root, _, files in os.walk(dl_root):
        for f in files:
            if f.endswith('.csv'):
                return os.path.join(root, f)
    return None


def integrate(dl_root):
    """
    Walk the downloaded DeepWeeds tree. The dataset may have:
    - images/ directory with all images + a labels.csv mapping filename->class
    - OR class-organized subdirectories
    Verify images, deduplicate via MD5, merge into combined_dataset.
    """
    os.makedirs(COMBINED_DIR, exist_ok=True)

    # Pre-hash existing combined images
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

    # Strategy 1: Check for labels CSV (DeepWeeds typical format)
    labels_csv = find_labels_csv(dl_root)
    label_map = {}

    if labels_csv:
        import csv
        log(f"Found labels CSV: {labels_csv}")
        with open(labels_csv, newline='', encoding='utf-8') as csvf:
            reader = csv.reader(csvf)
            header = next(reader, None)
            for row in reader:
                if len(row) >= 2:
                    fname = row[0].strip()
                    try:
                        label_id = int(row[1].strip())
                        label_map[fname] = label_id
                    except ValueError:
                        pass
        log(f"Loaded {len(label_map):,} label mappings from CSV.")

    # Strategy 2: Find all image files
    all_images = []
    for root, dirs, files in os.walk(dl_root):
        for f in files:
            if os.path.splitext(f)[1].lower() in VALID_EXTS:
                all_images.append((root, f))

    # Also check for class-organized subdirectories
    class_dirs = {}
    for root, dirs, files in os.walk(dl_root):
        img_files = [f for f in files if os.path.splitext(f)[1].lower() in VALID_EXTS]
        if img_files and len(img_files) >= 5:
            folder = os.path.basename(root)
            class_dirs[folder] = (root, img_files)

    log(f"Found {len(all_images):,} total images, {len(class_dirs)} potential class folders.")

    # Determine approach: use CSV labels if available, otherwise use folder structure
    if label_map and len(label_map) > 100:
        log("Using CSV label mapping approach.")
        total_to_process = len(all_images)
        processed = 0

        for img_root, fname in all_images:
            processed += 1
            src = os.path.join(img_root, fname)

            # Determine class
            base = os.path.splitext(fname)[0]
            if fname in label_map:
                label_id = label_map[fname]
            elif base in label_map:
                label_id = label_map[base]
            else:
                # Try matching with extension variants
                found = False
                for ext in ['.jpg', '.jpeg', '.png']:
                    key = base + ext
                    if key in label_map:
                        label_id = label_map[key]
                        found = True
                        break
                if not found:
                    continue

            cls_name = DEEPWEEDS_CLASSES.get(label_id, f"DeepWeeds_Class_{label_id}")

            dw_cls = os.path.join(DEEPWEEDS_DIR, cls_name)
            combined_cls = os.path.join(COMBINED_DIR, cls_name)
            os.makedirs(dw_cls, exist_ok=True)
            os.makedirs(combined_cls, exist_ok=True)

            if cls_name not in existing_set:
                new_classes_added.append(cls_name)
                existing_classes.append(cls_name)
                existing_set.add(cls_name)

            if not verify_image(src):
                total_corrupt += 1
                continue
            h = md5(src)
            if h and h in seen:
                total_dup += 1
                continue
            if h:
                seen.add(h)

            dst_dw = os.path.join(dw_cls, fname)
            dst_cb = os.path.join(combined_cls, fname)
            if not os.path.exists(dst_dw):
                shutil.copy2(src, dst_dw)
            if not os.path.exists(dst_cb):
                shutil.copy2(src, dst_cb)
            total_added += 1

            # Progress every 2 min
            now = time.time()
            if now - last_report >= 120:
                pct = round(processed / max(1, total_to_process) * 100, 1)
                elapsed = round((now - start) / 60, 1)
                log(f"\n{'='*60}\nDEEPWEEDS PROGRESS\n{'='*60}\n"
                    f"• Progress: {pct}%\n• Images verified: {total_added:,}\n"
                    f"• Corrupted: {total_corrupt}\n• Duplicates: {total_dup}\n"
                    f"• Elapsed: {elapsed} min\n{'='*60}\n")
                last_report = now

    else:
        log("Using folder-based approach.")
        total_cls_count = len(class_dirs)
        cls_idx = 0

        for folder, (cls_root, img_files) in class_dirs.items():
            cls_idx += 1
            # Map numeric folder to name
            try:
                label_id = int(folder)
                cls_name = DEEPWEEDS_CLASSES.get(label_id, f"DeepWeeds_Class_{label_id}")
            except ValueError:
                cls_name = folder.replace(" ", "_")
                # If it's a generic name, prefix it
                if cls_name.lower() not in [v.lower() for v in DEEPWEEDS_CLASSES.values()]:
                    if "weed" not in cls_name.lower():
                        cls_name = cls_name

            dw_cls = os.path.join(DEEPWEEDS_DIR, cls_name)
            combined_cls = os.path.join(COMBINED_DIR, cls_name)
            os.makedirs(dw_cls, exist_ok=True)
            os.makedirs(combined_cls, exist_ok=True)

            if cls_name not in existing_set:
                new_classes_added.append(cls_name)
                existing_classes.append(cls_name)
                existing_set.add(cls_name)

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

                dst_dw = os.path.join(dw_cls, fname)
                dst_cb = os.path.join(combined_cls, fname)
                if not os.path.exists(dst_dw):
                    shutil.copy2(src, dst_dw)
                if not os.path.exists(dst_cb):
                    shutil.copy2(src, dst_cb)
                total_added += 1

            now = time.time()
            if now - last_report >= 120 or cls_idx == total_cls_count:
                pct = round(cls_idx / max(1, total_cls_count) * 100, 1)
                elapsed = round((now - start) / 60, 1)
                log(f"\n{'='*60}\nDEEPWEEDS PROGRESS\n{'='*60}\n"
                    f"• Progress: {pct}%\n• Images verified: {total_added:,}\n"
                    f"• Classes processed: {cls_idx}/{total_cls_count}\n"
                    f"• Corrupted: {total_corrupt}\n• Duplicates: {total_dup}\n"
                    f"• Elapsed: {elapsed} min\n{'='*60}\n")
                last_report = now

    return new_classes_added, total_added, total_corrupt, total_dup


def get_dir_size(path):
    total = 0
    for root, _, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            if os.path.isfile(fp):
                total += os.path.getsize(fp)
    return total


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
                    "empty_classes": len(missing), "new_classes_from_deepweeds": len(new_classes),
                    "images_from_deepweeds": images_added}, fp, indent=2)

    sources_path = os.path.join(REPORTS_DIR, "dataset_sources.json")
    sources = {"sources": []}
    if os.path.exists(sources_path):
        with open(sources_path) as fp:
            sources = json.load(fp)
    if not any("DeepWeeds" in (s.get("name", s) if isinstance(s, dict) else s) for s in sources["sources"]):
        sources["sources"].append({"name": "DeepWeeds Dataset", "type": "Kaggle / Academic",
                                    "classes": 9, "images": images_added, "status": "Active & Verified"})
    with open(sources_path, "w") as fp:
        json.dump(sources, fp, indent=2)

    with open(os.path.join(REPORTS_DIR, "missing_classes.json"), "w") as fp:
        json.dump(missing, fp, indent=2)

    with open(CLASSES_PATH, "w") as fp:
        json.dump(sorted(set(all_classes)), fp, indent=2)

    return total_images, len(active), completeness


def main():
    log("=" * 70)
    log("DEEPWEEDS DATASET DOWNLOAD & INTEGRATION — START")
    log("=" * 70)
    t0 = time.time()

    # 1. Download
    dl_path = download_deepweeds()
    if not dl_path or not os.path.exists(dl_path):
        log("ERROR: Could not download DeepWeeds from any source. Aborting.")
        return

    # 2. Integrate
    new_classes, added, corrupt, dups = integrate(dl_path)

    # 3. Storage
    dw_size = get_dir_size(DEEPWEEDS_DIR)
    dw_size_gb = round(dw_size / (1024**3), 2)

    # 4. Update reports
    total_imgs, total_cls, completeness = update_reports(new_classes, added)

    elapsed = round((time.time() - t0) / 60, 1)

    summary = (
        f"\n{'='*70}\n"
        f"DEEPWEEDS INTEGRATION — COMPLETE\n"
        f"{'='*70}\n"
        f"• Weed classes added:                  {len(new_classes)}\n"
        f"• Total images downloaded & verified:  {added:,}\n"
        f"• Corrupted images removed:            {corrupt}\n"
        f"• Duplicate images skipped:            {dups}\n"
        f"• DeepWeeds storage used:              {dw_size_gb} GB\n"
        f"• Storage location:                    datasets/DeepWeeds/\n"
        f"• Updated total images in dataset:     {total_imgs:,}\n"
        f"• Updated total active classes:        {total_cls}\n"
        f"• Dataset completeness:                {completeness}%\n"
        f"• Elapsed time:                        {elapsed} min\n"
        f"{'='*70}\n"
        f"\nNew weed classes:\n"
    )
    for i, c in enumerate(new_classes, 1):
        summary += f"  {i}. {c}\n"
    log(summary)


if __name__ == "__main__":
    main()
