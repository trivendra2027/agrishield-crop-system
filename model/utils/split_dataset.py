"""
Stratified Dataset Splitting Script
Splits datasets/balanced_dataset into Train (70%), Validation (15%), and Test (15%) splits
using a deterministic Stratified Split across all 1,226 classes. Saves outputs to datasets/split_dataset/
and generates split statistics in model/evaluation/reports/.
"""
import os
import sys
import json
import time
import random
import logging
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from model.configs.config import PipelineConfig

logger = logging.getLogger("DatasetSplitter")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

WORKSPACE = PipelineConfig.WORKSPACE_ROOT
BALANCED_DIR = os.path.join(WORKSPACE, "datasets", "balanced_dataset")
SPLIT_DIR = os.path.join(WORKSPACE, "datasets", "split_dataset")
TRAIN_DIR = os.path.join(SPLIT_DIR, "train")
VAL_DIR = os.path.join(SPLIT_DIR, "val")
TEST_DIR = os.path.join(SPLIT_DIR, "test")
REPORTS_DIR = PipelineConfig.REPORTS_DIR
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}
SEED = PipelineConfig.SEED  # 42


def log(msg):
    logger.info(msg)


def split_class(cls_name):
    """Performs 70/15/15 stratified split for a single class."""
    src_cls_dir = os.path.join(BALANCED_DIR, cls_name)
    if not os.path.isdir(src_cls_dir):
        return cls_name, 0, 0, 0

    img_files = sorted([f for f in os.listdir(src_cls_dir) if os.path.splitext(f)[1].lower() in VALID_EXTS])
    total = len(img_files)

    if total == 0:
        return cls_name, 0, 0, 0

    # Deterministic shuffle
    rng = random.Random(SEED + hash(cls_name))
    shuffled = list(img_files)
    rng.shuffle(shuffled)

    # Calculate 70 / 15 / 15 counts
    n_train = int(round(total * 0.70))
    n_val = int(round(total * 0.15))
    n_test = total - n_train - n_val

    # Ensure at least 1 image per split if total >= 3
    if total >= 3:
        if n_train == 0:
            n_train = 1
        if n_val == 0:
            n_val = 1
        if n_test == 0:
            n_test = 1
        # Re-adjust train to match sum
        n_train = total - n_val - n_test

    train_imgs = shuffled[:n_train]
    val_imgs = shuffled[n_train:n_train + n_val]
    test_imgs = shuffled[n_train + n_val:]

    dst_train_cls = os.path.join(TRAIN_DIR, cls_name)
    dst_val_cls = os.path.join(VAL_DIR, cls_name)
    dst_test_cls = os.path.join(TEST_DIR, cls_name)

    os.makedirs(dst_train_cls, exist_ok=True)
    os.makedirs(dst_val_cls, exist_ok=True)
    os.makedirs(dst_test_cls, exist_ok=True)

    for f in train_imgs:
        shutil.copy2(os.path.join(src_cls_dir, f), os.path.join(dst_train_cls, f))

    for f in val_imgs:
        shutil.copy2(os.path.join(src_cls_dir, f), os.path.join(dst_val_cls, f))

    for f in test_imgs:
        shutil.copy2(os.path.join(src_cls_dir, f), os.path.join(dst_test_cls, f))

    return cls_name, len(train_imgs), len(val_imgs), len(test_imgs)


def main():
    log("=" * 70)
    log("STRATIFIED DATASET SPLITTING (70% Train / 15% Val / 15% Test)")
    log("=" * 70)
    t0 = time.time()

    os.makedirs(SPLIT_DIR, exist_ok=True)
    os.makedirs(TRAIN_DIR, exist_ok=True)
    os.makedirs(VAL_DIR, exist_ok=True)
    os.makedirs(TEST_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)

    classes = sorted([c for c in os.listdir(BALANCED_DIR) if os.path.isdir(os.path.join(BALANCED_DIR, c))])
    log(f"Step 1: Found {len(classes):,} balanced classes to split...")

    total_train = 0
    total_val = 0
    total_test = 0
    per_class_splits = {}

    log("Steps 2-5: Executing Stratified Split with seed=42 across 16 threads...")

    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = [executor.submit(split_class, cls) for cls in classes]

        completed = 0
        for future in as_completed(futures):
            cls_name, n_tr, n_v, n_te = future.result()
            completed += 1

            total_train += n_tr
            total_val += n_v
            total_test += n_te
            per_class_splits[cls_name] = {"train": n_tr, "val": n_v, "test": n_te, "total": n_tr + n_v + n_te}

            if completed % 200 == 0 or completed == len(classes):
                log(f"  Split {completed}/{len(classes)} classes... (Train: {total_train:,}, Val: {total_val:,}, Test: {total_test:,})")

    total_all = total_train + total_val + total_test
    pct_train = round(total_train / max(1, total_all) * 100, 2)
    pct_val = round(total_val / max(1, total_all) * 100, 2)
    pct_test = round(total_test / max(1, total_all) * 100, 2)

    # Save reports in model/evaluation/reports
    log("Steps 6-7: Generating split statistics and saving reports...")

    split_report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "split_ratio": {"train": 0.70, "val": 0.15, "test": 0.15},
        "seed": SEED,
        "total_classes": len(classes),
        "total_images": total_all,
        "train_images": total_train,
        "train_percentage": pct_train,
        "val_images": total_val,
        "val_percentage": pct_val,
        "test_images": total_test,
        "test_percentage": pct_test,
        "split_directory": SPLIT_DIR,
        "execution_time_minutes": round((time.time() - t0) / 60, 2)
    }

    split_statistics = {
        "dataset_name": "split_dataset",
        "total_classes": len(classes),
        "train": {"images": total_train, "percentage": pct_train, "path": TRAIN_DIR},
        "val": {"images": total_val, "percentage": pct_val, "path": VAL_DIR},
        "test": {"images": total_test, "percentage": pct_test, "path": TEST_DIR},
        "per_class_sample": {k: per_class_splits[k] for k in list(per_class_splits.keys())[:10]}
    }

    with open(os.path.join(REPORTS_DIR, "dataset_split_report.json"), "w") as f:
        json.dump(split_report, f, indent=2)

    with open(os.path.join(REPORTS_DIR, "dataset_split_statistics.json"), "w") as f:
        json.dump(split_statistics, f, indent=2)

    elapsed_min = round((time.time() - t0) / 60, 2)

    summary_msg = (
        f"\n{'='*70}\n"
        f"STRATIFIED DATASET SPLITTING COMPLETE\n"
        f"{'='*70}\n"
        f"• Total classes split:          {len(classes):,}\n"
        f"• Total images in dataset:       {total_all:,}\n"
        f"• Training Set (70%):            {total_train:,} images ({pct_train}%)\n"
        f"• Validation Set (15%):          {total_val:,} images ({pct_val}%)\n"
        f"• Test Set (15%):                {total_test:,} images ({pct_test}%)\n"
        f"• Output directory:              datasets/split_dataset/\n"
        f"  ├── train/ ({len(os.listdir(TRAIN_DIR))} class folders)\n"
        f"  ├── val/   ({len(os.listdir(VAL_DIR))} class folders)\n"
        f"  └── test/  ({len(os.listdir(TEST_DIR))} class folders)\n"
        f"• Reports location:              model/evaluation/reports/\n"
        f"• Total execution time:          {elapsed_min} min\n"
        f"{'='*70}\n"
    )
    log(summary_msg)


if __name__ == "__main__":
    main()
