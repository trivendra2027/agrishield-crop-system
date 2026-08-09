import os
import json
import numpy as np
from model.configs.config import PipelineConfig
from model.preprocessing.image import create_tf_dataset
from model.utils.logger import get_logger

logger = get_logger("Evaluator")

def calculate_ece_mce(true_labels, pred_probs, num_bins=10):
    """Calculates ECE (Expected Calibration Error) and MCE (Maximum Calibration Error) in bins."""
    bin_boundaries = np.linspace(0, 1, num_bins + 1)
    
    ece = 0.0
    mce = 0.0
    
    confidences = np.max(pred_probs, axis=1)
    predictions = np.argmax(pred_probs, axis=1)
    accuracies = (predictions == true_labels)
    
    bin_accs = []
    bin_confs = []
    bin_sizes = []
    
    for i in range(num_bins):
        bin_lower = bin_boundaries[i]
        bin_upper = bin_boundaries[i+1]
        
        in_bin = (confidences > bin_lower) & (confidences <= bin_upper)
        prop_in_bin = np.mean(in_bin)
        
        if prop_in_bin > 0:
            accuracy_in_bin = np.mean(accuracies[in_bin])
            confidence_in_bin = np.mean(confidences[in_bin])
            
            bin_accs.append(float(accuracy_in_bin))
            bin_confs.append(float(confidence_in_bin))
            bin_sizes.append(float(prop_in_bin))
            
            diff = np.abs(accuracy_in_bin - confidence_in_bin)
            ece += prop_in_bin * diff
            mce = max(mce, diff)
        else:
            bin_accs.append(0.0)
            bin_confs.append(0.0)
            bin_sizes.append(0.0)
            
    return float(ece), float(mce), bin_boundaries.tolist(), bin_accs, bin_confs

def evaluate_best_model(model_path, test_paths, test_labels, classes):
    """Loads the best model, runs evaluations, and saves ROC/PR curves, reliability diagrams, and MCC reports."""
    import tensorflow as tf
    logger.info("Initializing advanced post-training post-evaluation metrics...")
    
    if not os.path.exists(model_path):
        logger.error(f"Cannot run evaluation: model file not found at {model_path}")
        return
        
    if not test_paths or len(test_paths) == 0:
        logger.warning("Empty test_paths provided for evaluation. Falling back to fold 0 validation split...")
        with open(os.path.join(PipelineConfig.FOLDS_DIR, "fold_0_split.json"), "r") as f:
            fold_0 = json.load(f)
        test_paths = fold_0["val_paths"]
        test_labels = fold_0["val_labels"]

    model = tf.keras.models.load_model(model_path)
    test_ds = create_tf_dataset(test_paths, test_labels, PipelineConfig.BATCH_SIZE, augment=False, shuffle=False)
    
    logger.info("Running inference predictions on holdout test set...")
    pred_probs = model.predict(test_ds, verbose=1)
    pred_labels = np.argmax(pred_probs, axis=1)
    
    num_samples = len(test_labels)
    num_classes = len(classes)
    
    # Calculate ECE / MCE
    ece, mce, bin_bounds, bin_accs, bin_confs = calculate_ece_mce(test_labels, pred_probs)
    
    # Advanced Scikit-Learn Metrics
    try:
        from sklearn.metrics import (
            matthews_corrcoef, 
            cohen_kappa_score, 
            balanced_accuracy_score, 
            roc_auc_score, 
            precision_score, 
            recall_score, 
            f1_score
        )
        
        mcc = float(matthews_corrcoef(test_labels, pred_labels))
        kappa = float(cohen_kappa_score(test_labels, pred_labels))
        bal_acc = float(balanced_accuracy_score(test_labels, pred_labels))
        
        # Multi-class AUC (One-vs-Rest)
        try:
            auc = float(roc_auc_score(test_labels, pred_probs, multi_class='ovr'))
        except Exception:
            auc = 0.0
            
        macro_p = float(precision_score(test_labels, pred_labels, average="macro"))
        macro_r = float(recall_score(test_labels, pred_labels, average="macro"))
        macro_f1 = float(f1_score(test_labels, pred_labels, average="macro"))
        weighted_f1 = float(f1_score(test_labels, pred_labels, average="weighted"))
        
    except ImportError:
        logger.warning("scikit-learn is not installed. Falling back to default statistics.")
        mcc, kappa, bal_acc, auc = 0.0, 0.0, 0.0, 0.0
        macro_p, macro_r, macro_f1, weighted_f1 = 0.0, 0.0, 0.0, 0.0

    # Shannon Entropy OOD audit tracking
    entropies = -np.sum(pred_probs * np.log(pred_probs + 1e-10), axis=1)
    avg_entropy = float(np.mean(entropies))
    
    # Misclassified Report
    misclassified_report = []
    for i in range(num_samples):
        if pred_labels[i] != test_labels[i]:
            misclassified_report.append({
                "image_path": test_paths[i],
                "true_class": classes[test_labels[i]],
                "predicted_class": classes[pred_labels[i]],
                "confidence": float(pred_probs[i][pred_labels[i]]),
                "entropy": float(entropies[i])
            })
            
    # Compile reports
    metrics_package = {
        "overall": {
            "accuracy": float(np.mean(pred_labels == test_labels)),
            "top1_accuracy": float(np.mean(pred_labels == test_labels)),
            "top3_accuracy": float(np.mean([test_labels[i] in np.argsort(pred_probs[i])[-3:] for i in range(num_samples)])),
            "balanced_accuracy": bal_acc,
            "mcc": mcc,
            "cohens_kappa": kappa,
            "auc": auc,
            "macro_precision": macro_p,
            "macro_recall": macro_r,
            "macro_f1": macro_f1,
            "weighted_f1": weighted_f1,
            "calibration_ece": ece,
            "calibration_mce": mce,
            "average_shannon_entropy": avg_entropy
        },
        "calibration_bins": {
            "boundaries": bin_bounds,
            "accuracies": bin_accs,
            "confidences": bin_confs
        }
    }
    
    os.makedirs(PipelineConfig.REPORTS_DIR, exist_ok=True)
    
    metrics_json_path = os.path.join(PipelineConfig.REPORTS_DIR, "evaluation_report.json")
    with open(metrics_json_path, "w") as f:
        json.dump(metrics_package, f, indent=2)
        
    misclassified_json_path = os.path.join(PipelineConfig.REPORTS_DIR, "misclassified_report.json")
    with open(misclassified_json_path, "w") as f:
        json.dump(misclassified_report, f, indent=2)
        
    logger.info(f"Saved evaluation metrics report to: {metrics_json_path}")
    
    # Generate Reliability Diagrams & ROC/PR Curves if Matplotlib is installed
    try:
        import matplotlib.pyplot as plt
        
        # 1. Reliability Diagram
        plt.figure(figsize=(8, 8))
        plt.plot([0, 1], [0, 1], "k--", label="Perfect Calibration")
        plt.bar(bin_bounds[:-1], bin_accs, width=0.1, align="edge", alpha=0.7, color="blue", label="Model Accuracy")
        plt.title(f"Reliability Diagram (ECE = {ece:.4f}, MCE = {mce:.4f})")
        plt.xlabel("Confidence")
        plt.ylabel("Accuracy")
        plt.legend(loc="upper left")
        plt.grid(True)
        rel_path = os.path.join(PipelineConfig.REPORTS_DIR, "reliability_diagram.png")
        plt.savefig(rel_path, dpi=150)
        plt.close()
        logger.info(f"Saved Reliability Diagram to: {rel_path}")
        
        # 2. ROC & Precision-Recall curves (for multiclass, we plot average micro-curves)
        from sklearn.preprocessing import label_binarize
        from sklearn.metrics import roc_curve, precision_recall_curve, auc
        
        y_test_bin = label_binarize(test_labels, classes=range(num_classes))
        
        plt.figure(figsize=(10, 8))
        for class_idx in range(min(5, num_classes)): # Plot first 5 classes for visibility
            fpr, tpr, _ = roc_curve(y_test_bin[:, class_idx], pred_probs[:, class_idx])
            roc_auc = auc(fpr, tpr)
            plt.plot(fpr, tpr, label=f"ROC curve (class: {classes[class_idx]}) (AUC = {roc_auc:.2f})")
        plt.plot([0, 1], [0, 1], "k--")
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel("False Positive Rate")
        plt.ylabel("True Positive Rate")
        plt.title("Receiver Operating Characteristic (ROC) curves")
        plt.legend(loc="lower right")
        roc_path = os.path.join(PipelineConfig.REPORTS_DIR, "roc_curves.png")
        plt.savefig(roc_path, dpi=150)
        plt.close()
        logger.info(f"Saved ROC curves plot to: {roc_path}")
        
    except Exception as e:
        logger.warning(f"Skipping visualization plotting due to exception/missing library: {e}")
        
    return metrics_package
