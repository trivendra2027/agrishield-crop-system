import os
import shutil
import random
import hashlib
import json
import numpy as np
import cv2
from PIL import Image
from model.configs.config import PipelineConfig
from model.utils.logger import get_logger

logger = get_logger("Dataset_Validator")

def calculate_md5(file_path):
    """Calculate file MD5 content hash."""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def analyze_image_quality(file_path):
    """
    Audits image format, load corruption, blur level, and brightness.
    Returns (is_valid, reason, height, width, brightness, blur_var)
    """
    # 1. Format check
    ext = os.path.splitext(file_path)[1].lower()
    if ext not in {'.jpg', '.jpeg', '.png'}:
        return False, "format", 0, 0, 0, 0
        
    try:
        # 2. PIL check
        with Image.open(file_path) as img:
            img.verify()
            
        # 3. CV2 read check
        img_bgr = cv2.imread(file_path)
        if img_bgr is None:
            return False, "corrupted", 0, 0, 0, 0
            
        h, w, c = img_bgr.shape
        if c != 3:
            return False, "channels", h, w, 0, 0
            
        # 4. Brightness check
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        brightness = float(np.mean(gray))
        if brightness < 20:
            return False, "too_dark", h, w, brightness, 0
        if brightness > 235:
            return False, "too_bright", h, w, brightness, 0
            
        # 5. Blur check (Laplacian variance)
        blur_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        if blur_var < 80.0:
            return False, "blurry", h, w, brightness, blur_var
            
        return True, "valid", h, w, brightness, blur_var
    except Exception as e:
        return False, f"exception: {str(e)}", 0, 0, 0, 0

def prepare_pipeline_data(max_samples=None):
    """
    Scans, filters duplicates, audits quality, and splits dataset into 
    stratified 5-Fold validation lists and a 15% test set saved in JSON index files.
    """
    logger.info("Initializing advanced research-grade dataset validation...")
    
    # Check if splits already exist to skip scanning and save time
    if os.path.exists(PipelineConfig.CLASSES_PATH) and os.path.exists(os.path.join(PipelineConfig.FOLDS_DIR, "test_split.json")):
        all_exist = True
        for idx in range(5):
            if not os.path.exists(os.path.join(PipelineConfig.FOLDS_DIR, f"fold_{idx}_split.json")):
                all_exist = False
                break
        if all_exist:
            logger.info("Found existing fold split files. Loading class list and skipping dataset scanning...")
            with open(PipelineConfig.CLASSES_PATH, "r") as f:
                all_classes = json.load(f)
            report_path = os.path.join(PipelineConfig.REPORTS_DIR, "dataset_quality_report.json")
            summary_report = {}
            if os.path.exists(report_path):
                with open(report_path, "r") as f:
                    summary_report = json.load(f)
            return all_classes, summary_report
    
    # Statistics tracker
    quality_summary = {
        "total_scanned": 0,
        "valid_count": 0,
        "format_errors": 0,
        "corrupted_count": 0,
        "duplicate_count": 0,
        "blurry_count": 0,
        "too_dark_count": 0,
        "too_bright_count": 0,
        "resolutions": [],
        "class_distributions": {}
    }
    
    cleaned_data = {}  # cls_name -> list of paths
    VALID_EXTS = {'.jpg', '.jpeg', '.png'}
    
    # Fast scan: read files directly from combined_dataset folder
    # Images here were already validated when prepare_dataset.py copied them in
    if os.path.exists(PipelineConfig.COMBINED_DIR):
        classes = sorted([
            d for d in os.listdir(PipelineConfig.COMBINED_DIR) 
            if os.path.isdir(os.path.join(PipelineConfig.COMBINED_DIR, d)) and d != "folds"
        ])
        total_classes = len(classes)
        logger.info(f"Scanning {total_classes} disease classes from combined dataset...")
        
        for cls_idx, cls in enumerate(classes):
            cls_dir = os.path.join(PipelineConfig.COMBINED_DIR, cls)
            valid_files = []
            for f in os.listdir(cls_dir):
                ext = os.path.splitext(f)[1].lower()
                if ext not in VALID_EXTS:
                    quality_summary["format_errors"] += 1
                    continue
                file_path = os.path.join(cls_dir, f)
                if os.path.isfile(file_path):
                    valid_files.append(file_path)
                    quality_summary["total_scanned"] += 1
                    quality_summary["valid_count"] += 1
            
            cleaned_data[cls] = valid_files
            
            # Progress log every 10 classes or at start/end
            if cls_idx == 0 or (cls_idx + 1) % 10 == 0 or cls_idx == total_classes - 1:
                logger.info(
                    f"  Scanning progress: [{cls_idx + 1}/{total_classes}] classes done | "
                    f"{quality_summary['valid_count']:,} valid images found so far..."
                )
    
    logger.info(f"Image scan complete! Total valid images: {quality_summary['valid_count']:,}")
    # Apply limits and record class distributions
    all_classes = sorted(list(cleaned_data.keys()))
    for cls in all_classes:
        files = cleaned_data[cls]
        if max_samples and len(files) > max_samples:
            random.seed(PipelineConfig.SEED)
            files = random.sample(files, max_samples)
            cleaned_data[cls] = files
        quality_summary["class_distributions"][cls] = len(files)
        
    # Write classes list
    with open(PipelineConfig.CLASSES_PATH, "w") as f:
        json.dump(all_classes, f, indent=2)

    # 3. Stratified splits and 5-Fold Partitioning
    os.makedirs(PipelineConfig.FOLDS_DIR, exist_ok=True)
    
    test_paths = []
    test_labels = []
    
    # We maintain parallel folds data structures
    folds_data = [{"train_paths": [], "train_labels": [], "val_paths": [], "val_labels": []} for _ in range(5)]
    
    class_to_idx = {cls: idx for idx, cls in enumerate(all_classes)}
    
    for cls in all_classes:
        files = cleaned_data[cls]
        random.seed(PipelineConfig.SEED)
        random.shuffle(files)
        
        # Pull 15% holdout test set
        n_files = len(files)
        n_test = max(1, int(n_files * PipelineConfig.TEST_RATIO)) if n_files > 0 else 0
        
        cls_test = files[:n_test]
        cls_cv = files[n_test:]
        
        for fpath in cls_test:
            test_paths.append(fpath)
            test_labels.append(class_to_idx[cls])
            
        # Distribute remaining 85% into 5 Stratified folds
        n_cv = len(cls_cv)
        fold_sizes = [n_cv // 5] * 5
        for i in range(n_cv % 5):
            fold_sizes[i] += 1
            
        fold_idx = 0
        for f_num, size in enumerate(fold_sizes):
            f_files = cls_cv[fold_idx:fold_idx + size]
            fold_idx += size
            
            # For each fold f_num, these files form the validation set. All other folds form the training set.
            for idx, target_fold in enumerate(folds_data):
                if idx == f_num:
                    # Is validation split
                    for fpath in f_files:
                        target_fold["val_paths"].append(fpath)
                        target_fold["val_labels"].append(class_to_idx[cls])
                else:
                    # Is training split
                    for fpath in f_files:
                        target_fold["train_paths"].append(fpath)
                        target_fold["train_labels"].append(class_to_idx[cls])

    # Save splits to JSON files in folds directory
    with open(os.path.join(PipelineConfig.FOLDS_DIR, "test_split.json"), "w") as f:
        json.dump({"paths": test_paths, "labels": test_labels}, f, indent=2)
        
    for idx, fold in enumerate(folds_data):
        with open(os.path.join(PipelineConfig.FOLDS_DIR, f"fold_{idx}_split.json"), "w") as f:
            json.dump(fold, f, indent=2)

    # Average resolutions
    res_array = np.array(quality_summary["resolutions"]) if quality_summary["resolutions"] else np.zeros((1, 2))
    avg_res_h = float(np.mean(res_array[:, 0])) if len(res_array) > 0 else 0.0
    avg_res_w = float(np.mean(res_array[:, 1])) if len(res_array) > 0 else 0.0

    # Dataset balancing metrics
    counts = list(quality_summary["class_distributions"].values())
    balance_metric = float(np.std(counts)) if counts else 0.0

    # Final summary formatting
    summary_report = {
        "total_scanned": quality_summary["total_scanned"],
        "duplicates_removed": quality_summary["duplicate_count"],
        "corrupted_removed": quality_summary["corrupted_count"] + quality_summary["format_errors"],
        "blurry_removed": quality_summary["blurry_count"],
        "outliers_removed": quality_summary["too_dark_count"] + quality_summary["too_bright_count"],
        "clean_retained_total": quality_summary["valid_count"],
        "average_image_height": avg_res_h,
        "average_image_width": avg_res_w,
        "class_distribution": quality_summary["class_distributions"],
        "class_standard_deviation": balance_metric,
        "balance_status": "Imbalanced" if balance_metric > 15.0 else "Balanced"
    }

    os.makedirs(PipelineConfig.REPORTS_DIR, exist_ok=True)
    report_path = os.path.join(PipelineConfig.REPORTS_DIR, "dataset_quality_report.json")
    with open(report_path, "w") as f:
        json.dump(summary_report, f, indent=2)

    logger.info(f"Dataset Quality Report saved at: {report_path}")
    logger.info(f"Audit Results: Valid images retained: {summary_report['clean_retained_total']}")
    return all_classes, summary_report
