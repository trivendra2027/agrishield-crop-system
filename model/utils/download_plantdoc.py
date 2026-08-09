"""
PlantDoc Dataset Downloader & Integrator
Downloads PlantDoc from GitHub (no auth required), extracts, verifies,
deduplicates, and merges into datasets/PlantDoc + datasets/combined_dataset.
"""
import os
import sys
import json
import time
import hashlib
import logging
import shutil
import zipfile
import urllib.request
from PIL import Image

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from model.configs.config import PipelineConfig

logger = logging.getLogger("PlantDoc_Downloader")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

PROGRESS_LOG = os.path.join(PipelineConfig.WORKSPACE_ROOT, "dataset_download_progress.log")
PLANTDOC_DIR = os.path.join(PipelineConfig.WORKSPACE_ROOT, "datasets", "PlantDoc")
COMBINED_DIR = PipelineConfig.COMBINED_DIR
REPORTS_DIR = PipelineConfig.REPORTS_DIR
CLASSES_PATH = PipelineConfig.CLASSES_PATH
VALID_EXTS = {'.jpg', '.jpeg', '.png'}

GITHUB_ZIP_URL = "https://github.com/pratikkayal/PlantDoc-Dataset/archive/refs/heads/master.zip"


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


def download_plantdoc():
    """Download PlantDoc zip from GitHub."""
    os.makedirs(PLANTDOC_DIR, exist_ok=True)
    zip_path = os.path.join(PLANTDOC_DIR, "plantdoc_master.zip")

    if os.path.exists(zip_path):
        log(f"Zip already exists at {zip_path}, skipping download.")
        return zip_path

    log(f"Downloading PlantDoc from {GITHUB_ZIP_URL} ...")
    try:
        def _progress(block_num, block_size, total_size):
            if block_num % 200 == 0:
                downloaded = block_num * block_size
                if total_size > 0:
                    pct = min(100, downloaded * 100 / total_size)
                    logger.info(f"  Download progress: {pct:.0f}%  ({downloaded / 1e6:.1f} MB / {total_size / 1e6:.1f} MB)")

        urllib.request.urlretrieve(GITHUB_ZIP_URL, zip_path, reporthook=_progress)
        log(f"Download complete: {zip_path}  ({os.path.getsize(zip_path) / 1e6:.1f} MB)")
        return zip_path
    except Exception as e:
        log(f"Download FAILED: {e}")
        return None


def extract(zip_path):
    """Extract the zip and return the root folder path."""
    log("Extracting zip...")
    extract_dir = os.path.join(PLANTDOC_DIR, "_extracted")
    if os.path.exists(extract_dir):
        shutil.rmtree(extract_dir)
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(extract_dir)
    log("Extraction complete.")
    # Find root folder inside extraction
    items = os.listdir(extract_dir)
    if len(items) == 1 and os.path.isdir(os.path.join(extract_dir, items[0])):
        return os.path.join(extract_dir, items[0])
    return extract_dir


def integrate(dl_root):
    """
    Walk the extracted tree, verify images, deduplicate via MD5,
    copy into datasets/PlantDoc/<class> AND datasets/combined_dataset/<class>.
    """
    os.makedirs(COMBINED_DIR, exist_ok=True)

    # Pre-hash existing combined images
    seen = set()
    for root, _, files in os.walk(COMBINED_DIR):
        for f in files:
            if os.path.splitext(f)[1].lower() in VALID_EXTS:
                h = md5(os.path.join(root, f))
                if h:
                    seen.add(h)
    log(f"Pre-hashed {len(seen):,} existing images for dedup.")

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
    classes_processed = 0
    start = time.time()
    last_report = start

    # Discover class folders
    class_dirs = []
    for root, dirs, files in os.walk(dl_root):
        img_files = [f for f in files if os.path.splitext(f)[1].lower() in VALID_EXTS]
        if img_files:
            class_dirs.append((root, img_files))

    total_classes = len(class_dirs)
    log(f"Found {total_classes} class folders with images in PlantDoc download.")

    for cls_root, img_files in class_dirs:
        cls_name = os.path.basename(cls_root).replace(" ", "_")
        classes_processed += 1

        plantdoc_cls = os.path.join(PLANTDOC_DIR, cls_name)
        combined_cls = os.path.join(COMBINED_DIR, cls_name)
        os.makedirs(plantdoc_cls, exist_ok=True)
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

            dst_pd = os.path.join(plantdoc_cls, fname)
            dst_cb = os.path.join(combined_cls, fname)
            if not os.path.exists(dst_pd):
                shutil.copy2(src, dst_pd)
            if not os.path.exists(dst_cb):
                shutil.copy2(src, dst_cb)
            total_added += 1

        # Progress report every 2 min
        now = time.time()
        if now - last_report >= 120 or classes_processed == total_classes:
            pct = round(classes_processed / max(1, total_classes) * 100, 1)
            elapsed = round((now - start) / 60, 1)
            report = (
                f"\n{'='*60}\n"
                f"PLANTDOC INTEGRATION PROGRESS\n"
                f"{'='*60}\n"
                f"• Download & process percentage: {pct}%\n"
                f"• Images downloaded & verified:  {total_added:,}\n"
                f"• Classes processed:             {classes_processed}/{total_classes}\n"
                f"• Corrupted removed:             {total_corrupt}\n"
                f"• Duplicates skipped:            {total_dup}\n"
                f"• Elapsed:                       {elapsed} min\n"
                f"{'='*60}\n"
            )
            log(report)
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
        json.dump({"total_ontology_classes": len(all_classes), "completed_classes": len(active), "missing_classes_count": len(missing), "total_images_retained": total_images, "completeness_score_pct": completeness}, fp, indent=2)

    with open(os.path.join(REPORTS_DIR, "dataset_statistics.json"), "w") as fp:
        json.dump({"total_classes": len(active), "total_images": total_images, "empty_classes": len(missing), "new_classes_from_plantdoc": len(new_classes), "images_from_plantdoc": images_added}, fp, indent=2)

    sources_path = os.path.join(REPORTS_DIR, "dataset_sources.json")
    sources = {"sources": []}
    if os.path.exists(sources_path):
        with open(sources_path) as fp:
            sources = json.load(fp)
    if not any("PlantDoc" in (s.get("name", s) if isinstance(s, dict) else s) for s in sources["sources"]):
        sources["sources"].append({"name": "PlantDoc Classification Dataset", "type": "GitHub / Open Source", "status": "Active & Verified"})
    with open(sources_path, "w") as fp:
        json.dump(sources, fp, indent=2)

    with open(os.path.join(REPORTS_DIR, "missing_classes.json"), "w") as fp:
        json.dump(missing, fp, indent=2)

    with open(CLASSES_PATH, "w") as fp:
        json.dump(sorted(set(all_classes)), fp, indent=2)

    return total_images, len(active), completeness


def main():
    log("=" * 70)
    log("PLANTDOC DATASET DOWNLOAD & INTEGRATION — START")
    log("=" * 70)
    t0 = time.time()

    # 1. Download
    zip_path = download_plantdoc()
    if not zip_path:
        return

    # 2. Extract
    dl_root = extract(zip_path)

    # 3. Integrate
    new_classes, added, corrupt, dups = integrate(dl_root)

    # 4. Update reports
    total_imgs, total_cls, completeness = update_reports(new_classes, added)

    elapsed = round((time.time() - t0) / 60, 1)

    summary = (
        f"\n{'='*70}\n"
        f"PLANTDOC INTEGRATION — COMPLETE\n"
        f"{'='*70}\n"
        f"• Total downloaded & verified images:  {added:,}\n"
        f"• New classes added:                   {len(new_classes)} {new_classes}\n"
        f"• Corrupted images removed:            {corrupt}\n"
        f"• Duplicate images skipped:            {dups}\n"
        f"• Storage location:                    datasets/PlantDoc/\n"
        f"• Updated total images in dataset:     {total_imgs:,}\n"
        f"• Updated total active classes:        {total_cls}\n"
        f"• Dataset completeness:                {completeness}%\n"
        f"• Elapsed time:                        {elapsed} min\n"
        f"{'='*70}\n"
    )
    log(summary)


if __name__ == "__main__":
    main()
