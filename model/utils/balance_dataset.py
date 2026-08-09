"""
Dataset Balancing & Targeted Augmentation Script
Analyzes image count per class, identifies minority classes, applies random data augmentation (rotation, flip, brightness, zoom)
ONLY to minority classes to reach a target threshold (200 images), copies majority classes without duplication,
and saves the balanced dataset to datasets/balanced_dataset.
"""
import os
import sys
import json
import time
import random
import logging
import shutil
import cv2
import numpy as np
from PIL import Image, ImageEnhance
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from model.configs.config import PipelineConfig

logger = logging.getLogger("DatasetBalancing")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

WORKSPACE = PipelineConfig.WORKSPACE_ROOT
COMBINED_DIR = PipelineConfig.COMBINED_DIR
BALANCED_DIR = os.path.join(WORKSPACE, "datasets", "balanced_dataset")
REPORTS_DIR = PipelineConfig.REPORTS_DIR
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}
TARGET_MIN_SAMPLES = 200  # Target minimum images per class


def log(msg):
    logger.info(msg)


def augment_image(cv_img):
    """Applies random transformations: rotation, flip, brightness, zoom."""
    h, w = cv_img.shape[:2]

    # 1. Random Flip
    if random.random() > 0.5:
        cv_img = cv2.flip(cv_img, 1)  # Horizontal flip

    # 2. Random Rotation (-20 to +20 degrees)
    angle = random.uniform(-20, 20)
    matrix = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    cv_img = cv2.warpAffine(cv_img, matrix, (w, h), borderMode=cv2.BORDER_REFLECT)

    # 3. Random Brightness & Contrast
    alpha = random.uniform(0.85, 1.15)  # Contrast
    beta = random.randint(-20, 20)      # Brightness
    cv_img = cv2.convertScaleAbs(cv_img, alpha=alpha, beta=beta)

    # 4. Random Zoom (0.9 to 1.1)
    zoom_factor = random.uniform(0.9, 1.1)
    if zoom_factor != 1.0:
        new_h, new_w = int(h * zoom_factor), int(w * zoom_factor)
        resized = cv2.resize(cv_img, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
        if zoom_factor > 1.0:
            # Crop center
            start_y = (new_h - h) // 2
            start_x = (new_w - w) // 2
            cv_img = resized[start_y:start_y + h, start_x:start_x + w]
        else:
            # Pad center
            pad_y = (h - new_h) // 2
            pad_x = (w - new_w) // 2
            padded = np.zeros_like(cv_img)
            padded[pad_y:pad_y + new_h, pad_x:pad_x + new_w] = resized
            cv_img = padded

    return cv_img


def process_class(cls_name):
    """Processes a single class: copies originals and augments if minority."""
    src_dir = os.path.join(COMBINED_DIR, cls_name)
    dst_dir = os.path.join(BALANCED_DIR, cls_name)
    os.makedirs(dst_dir, exist_ok=True)

    img_files = [f for f in os.listdir(src_dir) if os.path.splitext(f)[1].lower() in VALID_EXTS]
    orig_count = len(img_files)

    if orig_count == 0:
        return cls_name, 0, 0, False

    # Copy all original images to balanced dataset
    for f in img_files:
        src_fp = os.path.join(src_dir, f)
        dst_fp = os.path.join(dst_dir, f)
        if not os.path.exists(dst_fp):
            shutil.copy2(src_fp, dst_fp)

    augmented_added = 0
    is_minority = orig_count < TARGET_MIN_SAMPLES

    if is_minority:
        needed = TARGET_MIN_SAMPLES - orig_count
        # Read original images in memory for fast augmentation
        loaded_imgs = []
        for f in img_files:
            img_path = os.path.join(src_dir, f)
            img = cv2.imread(img_path)
            if img is not None:
                loaded_imgs.append((f, img))

        if loaded_imgs:
            aug_idx = 1
            while augmented_added < needed:
                orig_name, base_img = random.choice(loaded_imgs)
                aug_img = augment_image(base_img.copy())

                name_no_ext, ext = os.path.splitext(orig_name)
                aug_filename = f"aug_{aug_idx}_{name_no_ext}.jpg"
                aug_filepath = os.path.join(dst_dir, aug_filename)

                cv2.imwrite(aug_filepath, aug_img, [cv2.IMWRITE_JPEG_QUALITY, 92])
                augmented_added += 1
                aug_idx += 1

    final_count = orig_count + augmented_added
    return cls_name, orig_count, augmented_added, is_minority


def main():
    log("=" * 70)
    log("DATASET BALANCING & TARGETED AUGMENTATION")
    log("=" * 70)
    t0 = time.time()

    os.makedirs(BALANCED_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)

    classes = sorted([c for c in os.listdir(COMBINED_DIR) if os.path.isdir(os.path.join(COMBINED_DIR, c)) and c != "folds"])
    log(f"Step 1: Analyzing image counts for {len(classes):,} classes...")

    minority_classes_list = []
    majority_classes_list = []
    total_original_images = 0
    total_augmented_images = 0

    log(f"Step 2-4: Balancing classes to minimum {TARGET_MIN_SAMPLES} samples via data augmentation...")

    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = [executor.submit(process_class, cls) for cls in classes]

        completed = 0
        for future in as_completed(futures):
            cls_name, orig_cnt, aug_cnt, is_minority = future.result()
            completed += 1

            total_original_images += orig_cnt
            total_augmented_images += aug_cnt

            if is_minority:
                minority_classes_list.append({"class": cls_name, "original": orig_cnt, "augmented": aug_cnt, "total": orig_cnt + aug_cnt})
            else:
                majority_classes_list.append({"class": cls_name, "original": orig_cnt})

            if completed % 200 == 0 or completed == len(classes):
                log(f"  Processed {completed}/{len(classes)} classes... (Augmented images generated so far: {total_augmented_images:,})")

    total_balanced_images = total_original_images + total_augmented_images

    # Calculate statistics
    log("Step 5: Generating balanced dataset statistics...")
    balanced_counts = []
    for cls in os.listdir(BALANCED_DIR):
        p = os.path.join(BALANCED_DIR, cls)
        if os.path.isdir(p):
            n = len([f for f in os.listdir(p) if os.path.splitext(f)[1].lower() in VALID_EXTS])
            balanced_counts.append(n)

    min_b = min(balanced_counts) if balanced_counts else 0
    max_b = max(balanced_counts) if balanced_counts else 0
    avg_b = round(sum(balanced_counts) / max(1, len(balanced_counts)), 1)

    balancing_report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "target_min_samples_per_class": TARGET_MIN_SAMPLES,
        "total_classes": len(classes),
        "minority_classes_augmented_count": len(minority_classes_list),
        "majority_classes_count": len(majority_classes_list),
        "total_original_images": total_original_images,
        "total_augmented_images_generated": total_augmented_images,
        "total_balanced_dataset_images": total_balanced_images,
        "balanced_dir": BALANCED_DIR,
        "execution_time_minutes": round((time.time() - t0) / 60, 2)
    }

    statistics_report = {
        "dataset_name": "balanced_dataset",
        "total_classes": len(classes),
        "total_images": total_balanced_images,
        "original_images": total_original_images,
        "augmented_images": total_augmented_images,
        "min_images_per_class": min_b,
        "max_images_per_class": max_b,
        "avg_images_per_class": avg_b,
        "minority_classes_augmented": len(minority_classes_list),
        "majority_classes_direct_copied": len(majority_classes_list)
    }

    # Step 6: Save reports in model/evaluation/reports
    with open(os.path.join(REPORTS_DIR, "dataset_balancing_report.json"), "w") as f:
        json.dump(balancing_report, f, indent=2)

    with open(os.path.join(REPORTS_DIR, "balanced_dataset_statistics.json"), "w") as f:
        json.dump(statistics_report, f, indent=2)

    elapsed_min = round((time.time() - t0) / 60, 2)

    summary_msg = (
        f"\n{'='*70}\n"
        f"DATASET BALANCING & TARGETED AUGMENTATION COMPLETE\n"
        f"{'='*70}\n"
        f"• Target min samples per class:      {TARGET_MIN_SAMPLES}\n"
        f"• Total classes balanced:            {len(classes):,}\n"
        f"• Minority classes augmented:       {len(minority_classes_list):,}\n"
        f"• Majority classes direct copied:   {len(majority_classes_list):,}\n"
        f"• Original images copied:           {total_original_images:,}\n"
        f"• Synthetic augmented images added: {total_augmented_images:,}\n"
        f"• Total balanced dataset size:       {total_balanced_images:,} images\n"
        f"• Min / Avg / Max per class:        {min_b} / {avg_b} / {max_b:,}\n"
        f"• Balanced dataset location:         datasets/balanced_dataset/\n"
        f"• Reports location:                  model/evaluation/reports/\n"
        f"• Total execution time:              {elapsed_min} min\n"
        f"{'='*70}\n"
    )
    log(summary_msg)


if __name__ == "__main__":
    main()
