"""
IP102 Insect Pest Dataset Downloader & Integrator
Downloads the complete IP102 dataset (75,222 images, 102 pest classes)
from Kaggle, verifies, deduplicates, and merges into combined_dataset.
"""
import os
import sys
import json
import time
import hashlib
import logging
import shutil
import zipfile
from PIL import Image

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from model.configs.config import PipelineConfig

logger = logging.getLogger("IP102_Downloader")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

WORKSPACE = PipelineConfig.WORKSPACE_ROOT
PROGRESS_LOG = os.path.join(WORKSPACE, "dataset_download_progress.log")
IP102_DIR = os.path.join(WORKSPACE, "datasets", "IP102")
COMBINED_DIR = PipelineConfig.COMBINED_DIR
REPORTS_DIR = PipelineConfig.REPORTS_DIR
CLASSES_PATH = PipelineConfig.CLASSES_PATH
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}

# IP102 class names (102 pest species)
IP102_CLASSES = {
    0: "Rice_Leaf_Roller", 1: "Rice_Leaf_Caterpillar", 2: "Paddy_Stem_Maggot",
    3: "Asiatic_Rice_Borer", 4: "Yellow_Rice_Borer", 5: "Rice_Gall_Midge",
    6: "Rice_Stemfly", 7: "Brown_Planthopper", 8: "White_Backed_Planthopper",
    9: "Small_Brown_Planthopper", 10: "Rice_Stinkbug", 11: "Rice_Shell_Pest",
    12: "Grain_Spreader_Thrips", 13: "Rice_Leaf_Mite", 14: "Rice_Water_Weevil",
    15: "Rice_Leafhopper", 16: "Corn_Borer", 17: "Armyworm",
    18: "Corn_Stemfly", 19: "Peach_Borer", 20: "Corn_Earworm",
    21: "Fall_Webworm", 22: "Corn_Leaf_Aphid", 23: "Corn_Planthopper",
    24: "Wheat_Sawfly", 25: "Wheat_Midge", 26: "Wheat_Aphid",
    27: "Wheat_Armyworm", 28: "Wheat_Phloeothrips", 29: "Wheat_Blossom_Midge",
    30: "Beet_Armyworm", 31: "Beet_Fly", 32: "Beet_Weevil",
    33: "Sugar_Beet_Wireworm", 34: "Beet_Nematode", 35: "Beet_Flea_Beetle",
    36: "Soybean_Aphid", 37: "Soybean_Looper", 38: "Bean_Pyralid",
    39: "Soybean_Pod_Borer", 40: "Green_Stinkbug", 41: "Soybean_Leaf_Beetle",
    42: "Cotton_Bollworm", 43: "Cotton_Aphid", 44: "Pink_Bollworm",
    45: "Cotton_Cutworm", 46: "Cotton_Leafworm", 47: "Cotton_Whitefly",
    48: "Mole_Cricket", 49: "Gryllotalpa", 50: "Locust",
    51: "Lytta_Polita", 52: "Legume_Blister_Beetle", 53: "Blister_Beetle",
    54: "Therioaphis_Maculata", 55: "Alfalfa_Weevil", 56: "Alfalfa_Seed_Chalcid",
    57: "Tarnished_Plant_Bug", 58: "Alfalfa_Plant_Bug", 59: "Meadow_Moth",
    60: "Citrus_Flatid_Planthopper", 61: "Citrus_Psyllids", 62: "Citrus_Whitefly",
    63: "Citrus_Spiny_Whitefly", 64: "Citrus_Aphid", 65: "Citrus_Leafminer",
    66: "Citrus_Red_Mite", 67: "Citrus_Longhorned_Beetle", 68: "Green_Citrus_Aphid",
    69: "Peach_Aphid", 70: "Peach_Fruit_Moth", 71: "Peach_Fruit_Borer",
    72: "Peach_Leaf_Miner", 73: "Peach_Twig_Borer", 74: "Peach_Moth",
    75: "Peach_Weevil", 76: "Grape_Downy_Mildew_Mite", 77: "Grape_Berry_Moth",
    78: "Grape_Mealybug", 79: "Grape_Rose_Chafer", 80: "Grape_Flea_Beetle",
    81: "Grape_Sawfly", 82: "Grape_Whitefly", 83: "Apple_Codling_Moth",
    84: "Apple_Aphid", 85: "Apple_Red_Spider", 86: "Apple_Leaf_Miner",
    87: "Apple_Blossom_Weevil", 88: "Apple_Sawfly", 89: "Apple_Maggot",
    90: "Mango_Tip_Borer", 91: "Mango_Stem_Borer", 92: "Mango_Hopper",
    93: "Mango_Fruit_Fly", 94: "Mango_Shield_Bug", 95: "Mango_Scale_Insect",
    96: "Mango_Leaf_Webber", 97: "Tea_Mosquito_Bug", 98: "Tea_Green_Leafhopper",
    99: "Tea_Red_Spider_Mite", 100: "Tea_Tortrix", 101: "Tea_Looper",
}

KAGGLE_REFS = [
    "phucthaiv02/ip102-dataset",
    "rtlmhjbn/ip02-dataset",
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


def download_ip102():
    """Download IP102 from Kaggle using kagglehub with API token."""
    os.makedirs(IP102_DIR, exist_ok=True)
    
    # Set API token env var
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
    Walk the downloaded IP102 tree. The dataset uses numeric folder names (0-101).
    Map them to readable pest class names, verify images, deduplicate, merge.
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
    classes_processed = 0
    start = time.time()
    last_report = start

    # Discover image directories (could be numeric 0-101 or named)
    class_dirs = []
    for root, dirs, files in os.walk(dl_root):
        img_files = [f for f in files if os.path.splitext(f)[1].lower() in VALID_EXTS]
        if img_files and len(img_files) >= 5:  # skip dirs with very few imgs
            class_dirs.append((root, img_files))

    total_classes = len(class_dirs)
    log(f"Found {total_classes} class folders with images in IP102 download.")

    for cls_root, img_files in class_dirs:
        folder_name = os.path.basename(cls_root)
        classes_processed += 1

        # Map numeric folder to readable name
        try:
            cls_id = int(folder_name)
            cls_name = IP102_CLASSES.get(cls_id, f"IP102_Pest_{cls_id}")
        except ValueError:
            cls_name = folder_name.replace(" ", "_")

        ip102_cls = os.path.join(IP102_DIR, cls_name)
        combined_cls = os.path.join(COMBINED_DIR, cls_name)
        os.makedirs(ip102_cls, exist_ok=True)
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

            dst_ip = os.path.join(ip102_cls, fname)
            dst_cb = os.path.join(combined_cls, fname)
            if not os.path.exists(dst_ip):
                shutil.copy2(src, dst_ip)
            if not os.path.exists(dst_cb):
                shutil.copy2(src, dst_cb)
            cls_added += 1
            total_added += 1

        # Progress report every 2 minutes
        now = time.time()
        if now - last_report >= 120 or classes_processed == total_classes:
            pct = round(classes_processed / max(1, total_classes) * 100, 1)
            elapsed = round((now - start) / 60, 1)
            report = (
                f"\n{'='*60}\n"
                f"IP102 INTEGRATION PROGRESS\n"
                f"{'='*60}\n"
                f"• Progress:              {pct}%\n"
                f"• Images verified:       {total_added:,}\n"
                f"• Classes processed:     {classes_processed}/{total_classes}\n"
                f"• Corrupted removed:     {total_corrupt}\n"
                f"• Duplicates skipped:    {total_dup}\n"
                f"• Latest class:          {cls_name} (+{cls_added})\n"
                f"• Elapsed:               {elapsed} min\n"
                f"{'='*60}\n"
            )
            log(report)
            last_report = now

    return new_classes_added, total_added, total_corrupt, total_dup


def get_dir_size(path):
    """Get total size of directory in bytes."""
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
        json.dump({
            "total_ontology_classes": len(all_classes),
            "completed_classes": len(active),
            "missing_classes_count": len(missing),
            "total_images_retained": total_images,
            "completeness_score_pct": completeness,
        }, fp, indent=2)

    with open(os.path.join(REPORTS_DIR, "dataset_statistics.json"), "w") as fp:
        json.dump({
            "total_classes": len(active),
            "total_images": total_images,
            "empty_classes": len(missing),
            "new_classes_from_ip102": len(new_classes),
            "images_from_ip102": images_added,
        }, fp, indent=2)

    sources_path = os.path.join(REPORTS_DIR, "dataset_sources.json")
    sources = {"sources": []}
    if os.path.exists(sources_path):
        with open(sources_path) as fp:
            sources = json.load(fp)
    if not any("IP102" in (s.get("name", s) if isinstance(s, dict) else s) for s in sources["sources"]):
        sources["sources"].append({
            "name": "IP102 Insect Pest Dataset",
            "type": "Kaggle / Academic",
            "classes": 102,
            "images": images_added,
            "status": "Active & Verified",
        })
    with open(sources_path, "w") as fp:
        json.dump(sources, fp, indent=2)

    with open(os.path.join(REPORTS_DIR, "missing_classes.json"), "w") as fp:
        json.dump(missing, fp, indent=2)

    with open(CLASSES_PATH, "w") as fp:
        json.dump(sorted(set(all_classes)), fp, indent=2)

    return total_images, len(active), completeness


def main():
    log("=" * 70)
    log("IP102 INSECT PEST DATASET DOWNLOAD & INTEGRATION — START")
    log("=" * 70)
    t0 = time.time()

    # 1. Download
    dl_path = download_ip102()
    if not dl_path or not os.path.exists(dl_path):
        log("ERROR: Could not download IP102 from any source. Aborting.")
        return

    # 2. Integrate
    new_classes, added, corrupt, dups = integrate(dl_path)

    # 3. Compute storage
    ip102_size = get_dir_size(IP102_DIR)
    ip102_size_gb = round(ip102_size / (1024**3), 2)

    # 4. Update reports
    total_imgs, total_cls, completeness = update_reports(new_classes, added)

    elapsed = round((time.time() - t0) / 60, 1)

    summary = (
        f"\n{'='*70}\n"
        f"IP102 INTEGRATION — COMPLETE\n"
        f"{'='*70}\n"
        f"• Pest classes added:                  {len(new_classes)}\n"
        f"• Total images downloaded & verified:  {added:,}\n"
        f"• Corrupted images removed:            {corrupt}\n"
        f"• Duplicate images skipped:            {dups}\n"
        f"• IP102 storage used:                  {ip102_size_gb} GB\n"
        f"• Storage location:                    datasets/IP102/\n"
        f"• Updated total images in dataset:     {total_imgs:,}\n"
        f"• Updated total active classes:        {total_cls}\n"
        f"• Dataset completeness:                {completeness}%\n"
        f"• Elapsed time:                        {elapsed} min\n"
        f"{'='*70}\n"
        f"\nNew pest classes:\n"
    )
    for i, c in enumerate(new_classes, 1):
        summary += f"  {i:3d}. {c}\n"
    log(summary)


if __name__ == "__main__":
    main()
