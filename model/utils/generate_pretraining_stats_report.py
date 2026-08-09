"""
Pre-Training Statistics & Resource Estimation Generator
Analyzes datasets/split_dataset/ (train/val/test) and datasets/balanced_dataset/ to compute:
1. Images per class (Min, Max, Mean, Median).
2. Classes with < 50 images & < 100 images.
3. Largest and smallest classes.
4. Class imbalance ratio.
5. Resource Estimations: Training Time, GPU VRAM Memory Usage, and Model Size.
Saves pretraining_statistics_report.json in model/evaluation/reports/.
"""
import os
import sys
import json
import time
import math
import logging
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from model.configs.config import PipelineConfig

logger = logging.getLogger("PretrainingStats")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

WORKSPACE = PipelineConfig.WORKSPACE_ROOT
SPLIT_DIR = os.path.join(WORKSPACE, "datasets", "split_dataset")
TRAIN_DIR = os.path.join(SPLIT_DIR, "train")
BALANCED_DIR = os.path.join(WORKSPACE, "datasets", "balanced_dataset")
REPORTS_DIR = PipelineConfig.REPORTS_DIR
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}


def main():
    logger.info("=" * 70)
    logger.info("GENERATING PRE-TRAINING STATISTICS & RESOURCE ESTIMATION REPORT")
    logger.info("=" * 70)

    # 1. Analyze images per class in balanced & train sets
    balanced_counts = {}
    train_counts = {}

    for cls in os.listdir(BALANCED_DIR):
        cls_p = os.path.join(BALANCED_DIR, cls)
        if os.path.isdir(cls_p):
            cnt = len([f for f in os.listdir(cls_p) if os.path.splitext(f)[1].lower() in VALID_EXTS])
            balanced_counts[cls] = cnt

    for cls in os.listdir(TRAIN_DIR):
        cls_p = os.path.join(TRAIN_DIR, cls)
        if os.path.isdir(cls_p):
            cnt = len([f for f in os.listdir(cls_p) if os.path.splitext(f)[1].lower() in VALID_EXTS])
            train_counts[cls] = cnt

    # Total & Class Metrics
    total_classes = len(balanced_counts)
    b_values = list(balanced_counts.values())
    tr_values = list(train_counts.values())

    min_b_cnt = min(b_values)
    max_b_cnt = max(b_values)
    mean_b_cnt = round(float(np.mean(b_values)), 1)
    median_b_cnt = round(float(np.median(b_values)), 1)

    min_tr_cnt = min(tr_values)
    max_tr_cnt = max(tr_values)
    mean_tr_cnt = round(float(np.mean(tr_values)), 1)
    median_tr_cnt = round(float(np.median(tr_values)), 1)

    # Classes < 50 and < 100 images
    under_50_balanced = [cls for cls, cnt in balanced_counts.items() if cnt < 50]
    under_100_balanced = [cls for cls, cnt in balanced_counts.items() if cnt < 100]

    under_50_train = [cls for cls, cnt in train_counts.items() if cnt < 50]
    under_100_train = [cls for cls, cnt in train_counts.items() if cnt < 100]

    # Largest & Smallest Class
    largest_class_name = max(balanced_counts, key=balanced_counts.get)
    largest_class_cnt_balanced = balanced_counts[largest_class_name]
    largest_class_cnt_train = train_counts.get(largest_class_name, 0)

    smallest_class_name = min(balanced_counts, key=balanced_counts.get)
    smallest_class_cnt_balanced = balanced_counts[smallest_class_name]
    smallest_class_cnt_train = train_counts.get(smallest_class_name, 0)

    # Class Imbalance Ratio (Max / Min)
    imbalance_ratio_balanced = round(max_b_cnt / max(1, min_b_cnt), 2)
    imbalance_ratio_train = round(max_tr_cnt / max(1, min_tr_cnt), 2)

    # Resource Estimations
    # Model: EfficientNet / ResNet50 with 1,226 classes
    # Params: ~25.6 Million
    model_size_fp32_mb = round(25.6 * 4, 1)  # 102.4 MB
    model_size_fp16_mb = round(25.6 * 2, 1)  # 51.2 MB
    model_size_int8_mb = round(25.6 * 1, 1)  # 25.6 MB

    # GPU Memory Estimation (Batch Size 32, Image Size 224x224)
    # Weights + Gradients + Optimizer States + Activations
    gpu_vram_bs32_gb = 5.2
    gpu_vram_bs64_gb = 8.8

    # Training Time Estimation (264,877 train images)
    # Step time ~ 140ms per batch of 32 on modern GPU (RTX 3090/4090/T4)
    steps_per_epoch = math.ceil(sum(tr_values) / 32)
    sec_per_epoch = steps_per_epoch * 0.14
    min_per_epoch = round(sec_per_epoch / 60, 1)

    est_phase1_time_hrs = round((15 * min_per_epoch) / 60, 2)  # 15 Epochs Classifier Head
    est_phase2_time_hrs = round((25 * min_per_epoch * 1.3) / 60, 2)  # 25 Epochs Fine-Tuning
    est_total_training_hrs = round(est_phase1_time_hrs + est_phase2_time_hrs, 2)

    report_data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_classes": total_classes,
        "balanced_dataset_stats": {
            "total_images": sum(b_values),
            "min_images_per_class": min_b_cnt,
            "max_images_per_class": max_b_cnt,
            "mean_images_per_class": mean_b_cnt,
            "median_images_per_class": median_b_cnt,
            "classes_fewer_than_50_count": len(under_50_balanced),
            "classes_fewer_than_100_count": len(under_100_balanced),
            "largest_class": {"name": largest_class_name, "count": largest_class_cnt_balanced},
            "smallest_class": {"name": smallest_class_name, "count": smallest_class_cnt_balanced},
            "class_imbalance_ratio": imbalance_ratio_balanced
        },
        "train_split_stats": {
            "total_images": sum(tr_values),
            "min_images_per_class": min_tr_cnt,
            "max_images_per_class": max_tr_cnt,
            "mean_images_per_class": mean_tr_cnt,
            "median_images_per_class": median_tr_cnt,
            "classes_fewer_than_50_count": len(under_50_train),
            "classes_fewer_than_100_count": len(under_100_train),
            "largest_class": {"name": largest_class_name, "count": largest_class_cnt_train},
            "smallest_class": {"name": smallest_class_name, "count": smallest_class_cnt_train},
            "class_imbalance_ratio": imbalance_ratio_train
        },
        "resource_estimations": {
            "estimated_model_size": {
                "parameters": "25.6 Million",
                "fp32_uncompressed_mb": model_size_fp32_mb,
                "fp16_mixed_precision_mb": model_size_fp16_mb,
                "int8_quantized_tflite_mb": model_size_int8_mb
            },
            "estimated_gpu_memory_usage": {
                "batch_size_32_vram_gb": gpu_vram_bs32_gb,
                "batch_size_64_vram_gb": gpu_vram_bs64_gb,
                "recommended_minimum_vram_gb": "8.0 GB"
            },
            "estimated_training_time": {
                "train_images": sum(tr_values),
                "steps_per_epoch_bs32": steps_per_epoch,
                "est_minutes_per_epoch": min_per_epoch,
                "phase1_classifier_head_15_epochs_hrs": est_phase1_time_hrs,
                "phase2_finetuning_25_epochs_hrs": est_phase2_time_hrs,
                "total_estimated_pipeline_hours": est_total_training_hrs
            }
        }
    }

    report_path = os.path.join(REPORTS_DIR, "pretraining_statistics_report.json")
    with open(report_path, "w") as f:
        json.dump(report_data, f, indent=2)

    logger.info(f"Report successfully written to: {report_path}")
    logger.info("=" * 70)


if __name__ == "__main__":
    main()
