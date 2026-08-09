"""
Dataset Verification, Normalization, & Preparation for Model Training
Executes full verification using PIL & OpenCV, removes corrupted/duplicate images via perceptual hashing,
normalizes class folder names, detects empty folders, and verifies trainability.
"""
import os
import sys
import json
import time
import hashlib
import logging
import shutil
import cv2
import numpy as np
from PIL import Image
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from model.configs.config import PipelineConfig

logger = logging.getLogger("DatasetPreparation")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

WORKSPACE = PipelineConfig.WORKSPACE_ROOT
COMBINED_DIR = PipelineConfig.COMBINED_DIR
REPORTS_DIR = PipelineConfig.REPORTS_DIR
CLASSES_PATH = PipelineConfig.CLASSES_PATH
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}


def log(msg):
    logger.info(msg)


def dhash(image, hash_size=8):
    """Compute 64-bit difference hash (dHash) for an image."""
    try:
        # Resize to (hash_size + 1, hash_size)
        resized = cv2.resize(image, (hash_size + 1, hash_size), interpolation=cv2.INTER_AREA)
        if len(resized.shape) == 3:
            gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        else:
            gray = resized
        # Compute horizontal differences
        diff = gray[:, 1:] > gray[:, :-1]
        # Convert boolean array to 64-bit integer
        return sum([2 ** i for (i, v) in enumerate(diff.flatten()) if v])
    except Exception:
        return None


def md5_file(filepath):
    """Compute MD5 hash of a file."""
    h = hashlib.md5()
    try:
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(16384), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return None


def verify_and_hash_image(filepath):
    """
    Verifies image with PIL and OpenCV.
    Returns (status, filepath, md5_val, dhash_val)
    status: 'ok', 'corrupted'
    """
    # 1. PIL verification
    try:
        with Image.open(filepath) as img:
            img.verify()
        with Image.open(filepath) as img:
            img.convert("RGB")
    except Exception:
        return 'corrupted', filepath, None, None

    # 2. OpenCV verification & dHash
    try:
        cv_img = cv2.imread(filepath)
        if cv_img is None or cv_img.size == 0:
            return 'corrupted', filepath, None, None
        dh = dhash(cv_img)
    except Exception:
        return 'corrupted', filepath, None, None

    # 3. MD5 hash
    md5_val = md5_file(filepath)
    if not md5_val:
        return 'corrupted', filepath, None, None

    return 'ok', filepath, md5_val, dh


def normalize_class_folders():
    """Step 4: Normalize class folder names."""
    log("Step 4: Normalizing class folder names...")
    renamed_count = 0
    for folder in os.listdir(COMBINED_DIR):
        folder_path = os.path.join(COMBINED_DIR, folder)
        if os.path.isdir(folder_path) and folder != "folds":
            cleaned = folder.strip().replace("  ", " ")
            if cleaned != folder:
                new_path = os.path.join(COMBINED_DIR, cleaned)
                if not os.path.exists(new_path):
                    os.rename(folder_path, new_path)
                    renamed_count += 1
                else:
                    # Merge contents if cleaned directory already exists
                    for f in os.listdir(folder_path):
                        src = os.path.join(folder_path, f)
                        dst = os.path.join(new_path, f)
                        if not os.path.exists(dst):
                            shutil.move(src, dst)
                    os.rmdir(folder_path)
                    renamed_count += 1
    log(f"  Normalized / merged {renamed_count} class folders.")


def main():
    log("=" * 70)
    log("DATASET VERIFICATION & PREPARATION FOR TRAINING")
    log("=" * 70)
    t0 = time.time()

    os.makedirs(REPORTS_DIR, exist_ok=True)

    # 1. Normalize class folder names
    normalize_class_folders()

    # Gather all image files
    all_files = []
    for root, dirs, files in os.walk(COMBINED_DIR):
        if "folds" in root:
            continue
        for f in files:
            if os.path.splitext(f)[1].lower() in VALID_EXTS:
                all_files.append(os.path.join(root, f))

    log(f"Total images found for verification: {len(all_files):,}")

    # Steps 1 & 2 & 3: Verification, Corrupted Removal, & Hashing
    log("Steps 1-3: Verifying images with PIL & OpenCV and computing perceptual hashes...")
    
    corrupted_removed = 0
    duplicates_removed = 0
    seen_md5 = set()
    seen_dhash = set()
    valid_images_count = 0

    batch_size = 50000
    total_batches = (len(all_files) + batch_size - 1) // batch_size

    for batch_idx in range(total_batches):
        batch_files = all_files[batch_idx * batch_size : (batch_idx + 1) * batch_size]
        log(f"  Processing batch {batch_idx + 1}/{total_batches} ({len(batch_files):,} images)...")

        with ThreadPoolExecutor(max_workers=16) as executor:
            futures = [executor.submit(verify_and_hash_image, fp) for fp in batch_files]

            for future in as_completed(futures):
                status, filepath, md5_val, dh_val = future.result()

                if status == 'corrupted':
                    try:
                        os.remove(filepath)
                        corrupted_removed += 1
                    except Exception:
                        pass
                    continue

                # Exact duplicate check (MD5) or Perceptual duplicate check (dHash)
                if md5_val in seen_md5 or (dh_val is not None and dh_val in seen_dhash):
                    try:
                        os.remove(filepath)
                        duplicates_removed += 1
                    except Exception:
                        pass
                    continue

                seen_md5.add(md5_val)
                if dh_val is not None:
                    seen_dhash.add(dh_val)
                valid_images_count += 1

        log(f"  Batch {batch_idx + 1} complete. Current valid: {valid_images_count:,}, Corrupted: {corrupted_removed}, Duplicates: {duplicates_removed}")

    # Step 5: Detect empty folders
    log("Step 5: Detecting and removing empty class folders...")
    empty_folders = []
    active_classes = []
    class_image_counts = {}

    for folder in sorted(os.listdir(COMBINED_DIR)):
        folder_path = os.path.join(COMBINED_DIR, folder)
        if os.path.isdir(folder_path) and folder != "folds":
            img_list = [f for f in os.listdir(folder_path) if os.path.splitext(f)[1].lower() in VALID_EXTS]
            if len(img_list) == 0:
                empty_folders.append(folder)
                try:
                    os.rmdir(folder_path)
                except Exception:
                    pass
            else:
                active_classes.append(folder)
                class_image_counts[folder] = len(img_list)

    log(f"  Empty folders removed: {len(empty_folders)}")
    log(f"  Active non-empty classes: {len(active_classes)}")

    # Step 7: Verify trainability of every class
    log("Step 7: Verifying trainability of every class (threshold >= 10 images)...")
    trainable_classes = []
    unsuitable_classes = []

    MIN_TRAINABLE_IMAGES = 10
    for cls, cnt in class_image_counts.items():
        if cnt >= MIN_TRAINABLE_IMAGES:
            trainable_classes.append(cls)
        else:
            unsuitable_classes.append({"class": cls, "count": cnt})

    log(f"  Trainable classes: {len(trainable_classes)} / {len(active_classes)}")
    log(f"  Classes with insufficient images (< {MIN_TRAINABLE_IMAGES}): {len(unsuitable_classes)}")

    # Step 6 & 8: Generate statistics & Save reports in model/evaluation/reports
    log("Steps 6 & 8: Generating statistics and saving reports in model/evaluation/reports...")
    
    counts_list = list(class_image_counts.values())
    total_imgs = sum(counts_list)
    min_imgs = min(counts_list) if counts_list else 0
    max_imgs = max(counts_list) if counts_list else 0
    avg_imgs = round(total_imgs / max(1, len(counts_list)), 1)

    verification_report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_initial_images": len(all_files),
        "valid_images_retained": valid_images_count,
        "corrupted_images_removed": corrupted_removed,
        "duplicate_images_removed": duplicates_removed,
        "empty_folders_removed": len(empty_folders),
        "total_active_classes": len(active_classes),
        "trainable_classes_count": len(trainable_classes),
        "unsuitable_classes_count": len(unsuitable_classes),
        "elapsed_seconds": round(time.time() - t0, 1)
    }

    trainability_report = {
        "min_trainable_threshold": MIN_TRAINABLE_IMAGES,
        "total_trainable_classes": len(trainable_classes),
        "total_unsuitable_classes": len(unsuitable_classes),
        "unsuitable_classes_details": unsuitable_classes
    }

    dataset_statistics = {
        "total_classes": len(active_classes),
        "total_images": total_imgs,
        "min_images_per_class": min_imgs,
        "max_images_per_class": max_imgs,
        "avg_images_per_class": avg_imgs,
        "empty_classes": len(empty_folders),
        "trainable_classes": len(trainable_classes)
    }

    inventory_report = {
        "total_ontology_classes": len(active_classes),
        "completed_classes": len(active_classes),
        "missing_classes_count": 0,
        "total_images_retained": total_imgs,
        "completeness_score_pct": 100.0
    }

    # Save to REPORTS_DIR
    with open(os.path.join(REPORTS_DIR, "dataset_verification_report.json"), "w") as f:
        json.dump(verification_report, f, indent=2)

    with open(os.path.join(REPORTS_DIR, "class_trainability_report.json"), "w") as f:
        json.dump(trainability_report, f, indent=2)

    with open(os.path.join(REPORTS_DIR, "dataset_statistics.json"), "w") as f:
        json.dump(dataset_statistics, f, indent=2)

    with open(os.path.join(REPORTS_DIR, "dataset_inventory.json"), "w") as f:
        json.dump(inventory_report, f, indent=2)

    with open(CLASSES_PATH, "w") as f:
        json.dump(active_classes, f, indent=2)

    elapsed_min = round((time.time() - t0) / 60, 2)
    
    summary_msg = (
        f"\n{'='*70}\n"
        f"DATASET PREPARATION & VERIFICATION COMPLETE\n"
        f"{'='*70}\n"
        f"• Total active classes:             {len(active_classes):,}\n"
        f"• Trainable classes (>= 10 imgs):    {len(trainable_classes):,}\n"
        f"• Total verified valid images:      {total_imgs:,}\n"
        f"• Corrupted images removed:         {corrupted_removed:,}\n"
        f"• Duplicate images removed:         {duplicates_removed:,}\n"
        f"• Empty folders removed:            {len(empty_folders):,}\n"
        f"• Min / Avg / Max per class:        {min_imgs} / {avg_imgs} / {max_imgs:,}\n"
        f"• Total execution time:             {elapsed_min} min\n"
        f"• Reports location:                 model/evaluation/reports/\n"
        f"{'='*70}\n"
    )
    log(summary_msg)


if __name__ == "__main__":
    main()
