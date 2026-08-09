"""
Plant Nutrient Deficiency Dataset Downloader & Integrator
Downloads multiple Plant Nutrient Deficiency datasets from Kaggle, verifies, deduplicates, and merges into combined_dataset.
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

logger = logging.getLogger("NutrientDeficiency_Downloader")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

WORKSPACE = PipelineConfig.WORKSPACE_ROOT
PROGRESS_LOG = os.path.join(WORKSPACE, "dataset_download_progress.log")
NUTRIENT_DIR = os.path.join(WORKSPACE, "datasets", "NutrientDeficiency")
COMBINED_DIR = PipelineConfig.COMBINED_DIR
REPORTS_DIR = PipelineConfig.REPORTS_DIR
CLASSES_PATH = PipelineConfig.CLASSES_PATH
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}

KAGGLE_REFS = [
    "ashishpatelresearch/maize-plant-leaf-nutrient-deficiency-dataset",
    "guy007/nutrient-deficiency-symptoms-in-rice",
    "baronn/lettuce-npk-dataset",
    "binnassor/melon-leaves-macronutrient-deficiency-detasets",
    "paultimothymoore/nutrient-deficient-banana-plant-leaves"
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
    """Normalize common plant nutrient deficiency class names."""
    name = folder_name.lower().replace("_", " ").replace("-", " ")
    
    # Nitrogen
    if "nitrogen" in name or name == "n" or name.endswith(" n"):
        return "Deficiency_Nitrogen"
    # Phosphorus
    elif "phosphorus" in name or name == "p" or name.endswith(" p"):
        return "Deficiency_Phosphorus"
    # Potassium
    elif "potassium" in name or name == "k" or name.endswith(" k"):
        return "Deficiency_Potassium"
    # Calcium
    elif "calcium" in name or "ca" in name or name == "ca" or name.endswith(" ca"):
        return "Deficiency_Calcium"
    # Magnesium
    elif "magnesium" in name or "mg" in name or name == "mg" or name.endswith(" mg"):
        return "Deficiency_Magnesium"
    # Iron
    elif "iron" in name or "fe" in name or name == "fe" or name.endswith(" fe"):
        return "Deficiency_Iron"
    # Zinc
    elif "zinc" in name or "zn" in name or name == "zn" or name.endswith(" zn"):
        return "Deficiency_Zinc"
    # Boron
    elif "boron" in name or "b" in name or name == "b" or name.endswith(" b"):
        return "Deficiency_Boron"
    # Sulfur
    elif "sulfur" in name or "s" in name or name == "s" or name.endswith(" s"):
        return "Deficiency_Sulfur"
    # Copper
    elif "copper" in name or "cu" in name or name == "cu" or name.endswith(" cu"):
        return "Deficiency_Copper"
    # Manganese
    elif "manganese" in name or "mn" in name or name == "mn" or name.endswith(" mn"):
        return "Deficiency_Manganese"
    # Molybdenum
    elif "molybdenum" in name or "mo" in name or name == "mo" or name.endswith(" mo"):
        return "Deficiency_Molybdenum"
    # Healthy / Normal
    elif any(x in name for x in ["healthy", "normal", "absent"]):
        return "Deficiency_Healthy"
        
    return "Deficiency_" + folder_name.replace(" ", "_").replace("-", "_").title()


def integrate():
    """Download and integrate all Nutrient Deficiency datasets. Verify, deduplicate, merge."""
    os.makedirs(COMBINED_DIR, exist_ok=True)
    os.makedirs(NUTRIENT_DIR, exist_ok=True)

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

                nutrient_cls = os.path.join(NUTRIENT_DIR, cls_name)
                combined_cls = os.path.join(COMBINED_DIR, cls_name)
                os.makedirs(nutrient_cls, exist_ok=True)
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

                    dst_nutrient = os.path.join(nutrient_cls, fname)
                    dst_cb = os.path.join(combined_cls, fname)
                    if not os.path.exists(dst_nutrient):
                        shutil.copy2(src, dst_nutrient)
                    if not os.path.exists(dst_cb):
                        shutil.copy2(src, dst_cb)
                    cls_added += 1
                    total_added += 1

                now = time.time()
                if now - last_report >= 120:
                    elapsed = round((now - start) / 60, 1)
                    log(f"\n{'='*60}\n"
                        f"NUTRIENT DEFICIENCY PROGRESS\n"
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
                    "empty_classes": len(missing), "new_from_nutrient": len(new_classes),
                    "images_from_nutrient": images_added}, fp, indent=2)

    sources_path = os.path.join(REPORTS_DIR, "dataset_sources.json")
    sources = {"sources": []}
    if os.path.exists(sources_path):
        with open(sources_path) as fp:
            sources = json.load(fp)
    if not any("Nutrient Deficiency" in (s.get("name", s) if isinstance(s, dict) else s) for s in sources["sources"]):
        sources["sources"].append({"name": "Nutrient Deficiency Datasets", "type": "Kaggle",
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
    log("NUTRIENT DEFICIENCY DATASETS DOWNLOAD & INTEGRATION — START")
    log("=" * 70)
    t0 = time.time()

    new_classes, added, corrupt, dups = integrate()

    size_bytes = sum(os.path.getsize(os.path.join(root, f)) for root, _, files in os.walk(NUTRIENT_DIR) for f in files)
    size_gb = round(size_bytes / (1024**3), 2)
    total_imgs, total_cls, completeness = update_reports(new_classes, added)
    elapsed = round((time.time() - t0) / 60, 1)

    summary = (
        f"\n{'='*70}\n"
        f"NUTRIENT DEFICIENCY INTEGRATION — COMPLETE\n"
        f"{'='*70}\n"
        f"• New classes added:                   {len(new_classes)}\n"
        f"• Total images downloaded & verified:  {added:,}\n"
        f"• Corrupted images removed:            {corrupt}\n"
        f"• Duplicate images skipped:            {dups}\n"
        f"• Nutrient storage used:               {size_gb} GB\n"
        f"• Storage location:                    datasets/NutrientDeficiency/\n"
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
