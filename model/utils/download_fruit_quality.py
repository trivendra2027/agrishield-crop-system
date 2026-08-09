"""
Fruit Quality Dataset Downloader & Integrator
Downloads multiple Fruit Quality datasets from Kaggle, verifies, deduplicates, and merges into combined_dataset.
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

logger = logging.getLogger("FruitQuality_Downloader")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

WORKSPACE = PipelineConfig.WORKSPACE_ROOT
PROGRESS_LOG = os.path.join(WORKSPACE, "dataset_download_progress.log")
FRUIT_DIR = os.path.join(WORKSPACE, "datasets", "FruitQuality")
COMBINED_DIR = PipelineConfig.COMBINED_DIR
REPORTS_DIR = PipelineConfig.REPORTS_DIR
CLASSES_PATH = PipelineConfig.CLASSES_PATH
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}

KAGGLE_REFS = [
    "bttrll/fruit-ripeness",
    "mbkinaci/fruit-quality-classification",
    "themanik/african-plums-dataset",
    "amdatas/fruits-diseases-classification-dataset",
    "yusufakbar/apple-grading-data",
    "tuannguyenvan/orange-grading-dataset"
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


def normalize_class_name(folder_name):
    """Normalize common fruit quality and defect class names."""
    name = folder_name.lower().replace("_", " ").replace("-", " ")
    
    # Sunburn
    if "sunburn" in name:
        return "Fruit_Sunburn"
    # Bruises
    elif "bruise" in name or "bruised" in name:
        return "Fruit_Bruises"
    # Cracks
    elif "crack" in name or "cracked" in name:
        return "Fruit_Cracks"
    # Rot
    elif "rot" in name or "rotten" in name:
        return "Fruit_Rot"
    # Surface Defects / Scab / Blotch / Spot / Canker / Rust
    elif any(x in name for x in ["scab", "blotch", "spot", "spotted", "canker", "rust", "surface"]):
        return "Fruit_Surface_Defects"
    # General Defects
    elif any(x in name for x in ["bad", "defect", "defective", "damaged"]):
        return "Fruit_Defects"
    # Ripeness
    elif any(x in name for x in ["ripe", "overripe", "unripe"]):
        if "unripe" in name:
            return "Fruit_Ripeness_Unripe"
        elif "overripe" in name:
            return "Fruit_Ripeness_Overripe"
        else:
            return "Fruit_Ripeness_Ripe"
    # Maturity
    elif "maturity" in name or "mature" in name:
        return "Fruit_Maturity"
    # Grading / Export Quality
    elif any(x in name for x in ["grade", "good", "mixed", "unaffected", "healthy", "export"]):
        if "grade a" in name or "export" in name:
            return "Fruit_Export_Quality"
        return "Fruit_Grading"
    
    return "Fruit_" + folder_name.replace(" ", "_").replace("-", "_").title()


def integrate():
    """Download and integrate all Fruit Quality datasets. Verify, deduplicate, merge."""
    os.makedirs(COMBINED_DIR, exist_ok=True)
    os.makedirs(FRUIT_DIR, exist_ok=True)

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

    os.environ["KAGGLE_API_TOKEN"] = "KGAT_6ea2a3aeb5eee64adbe96cd1e551e708"
    import kagglehub

    for ref in KAGGLE_REFS:
        log(f"\nProcessing {ref}...")
        try:
            dl_path = kagglehub.dataset_download(ref)
            log(f"Downloaded {ref} to {dl_path}")
            
            class_dirs = []
            for root, dirs, files in os.walk(dl_path):
                img_files = [f for f in files if os.path.splitext(f)[1].lower() in VALID_EXTS]
                if img_files and len(img_files) >= 5:
                    basename = os.path.basename(root).lower()
                    if basename not in ('train', 'val', 'valid', 'test', 'images', 'data'):
                        class_dirs.append((root, img_files))

            for cls_root, img_files in class_dirs:
                folder_name = os.path.basename(cls_root)
                cls_name = normalize_class_name(folder_name)

                fruit_cls = os.path.join(FRUIT_DIR, cls_name)
                combined_cls = os.path.join(COMBINED_DIR, cls_name)
                os.makedirs(fruit_cls, exist_ok=True)
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

                    dst_fruit = os.path.join(fruit_cls, fname)
                    dst_cb = os.path.join(combined_cls, fname)
                    if not os.path.exists(dst_fruit):
                        shutil.copy2(src, dst_fruit)
                    if not os.path.exists(dst_cb):
                        shutil.copy2(src, dst_cb)
                    cls_added += 1
                    total_added += 1

                now = time.time()
                if now - last_report >= 120:
                    elapsed = round((now - start) / 60, 1)
                    log(f"\n{'='*60}\n"
                        f"FRUIT QUALITY PROGRESS\n"
                        f"{'='*60}\n"
                        f"• Current source: {ref}\n"
                        f"• Images verified so far: {total_added:,}\n"
                        f"• Corrupted so far: {total_corrupt}\n"
                        f"• Duplicates so far: {total_dup}\n"
                        f"• Latest class: {cls_name} (+{cls_added})\n"
                        f"• Elapsed: {elapsed} min\n"
                        f"{'='*60}\n")
                    last_report = now
        except Exception as e:
            log(f"  Failed ({ref}): {e}")

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
                    "empty_classes": len(missing), "new_from_fruit": len(new_classes),
                    "images_from_fruit": images_added}, fp, indent=2)

    sources_path = os.path.join(REPORTS_DIR, "dataset_sources.json")
    sources = {"sources": []}
    if os.path.exists(sources_path):
        with open(sources_path) as fp:
            sources = json.load(fp)
    if not any("Fruit Quality" in (s.get("name", s) if isinstance(s, dict) else s) for s in sources["sources"]):
        sources["sources"].append({"name": "Fruit Quality Datasets", "type": "Kaggle",
                                    "classes": len(new_classes), "images": images_added, "status": "Active & Verified"})
    with open(sources_path, "w") as fp:
        json.dump(sources, fp, indent=2)

    with open(os.path.join(REPORTS_DIR, "missing_classes.json"), "w") as fp:
        json.dump(missing, fp, indent=2)
    with open(CLASSES_PATH, "w") as fp:
        json.dump(sorted(set(all_classes)), fp, indent=2)
    return total_images, len(active), completeness


def main():
    log("=" * 70)
    log("FRUIT QUALITY DATASETS DOWNLOAD & INTEGRATION — START")
    log("=" * 70)
    t0 = time.time()

    new_classes, added, corrupt, dups = integrate()

    size_bytes = sum(os.path.getsize(os.path.join(root, f)) for root, _, files in os.walk(FRUIT_DIR) for f in files)
    size_gb = round(size_bytes / (1024**3), 2)
    total_imgs, total_cls, completeness = update_reports(new_classes, added)
    elapsed = round((time.time() - t0) / 60, 1)

    summary = (
        f"\n{'='*70}\n"
        f"FRUIT QUALITY INTEGRATION — COMPLETE\n"
        f"{'='*70}\n"
        f"• New classes added:                   {len(new_classes)}\n"
        f"• Total images downloaded & verified:  {added:,}\n"
        f"• Corrupted images removed:            {corrupt}\n"
        f"• Duplicate images skipped:            {dups}\n"
        f"• Fruit storage used:                  {size_gb} GB\n"
        f"• Storage location:                    datasets/FruitQuality/\n"
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
