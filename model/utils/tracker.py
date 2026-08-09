import os
import json
from datetime import datetime
from model.configs.config import PipelineConfig

def log_experiment_run(architecture, hp_config, test_metrics, duration_minutes):
    """Saves hyperparameters, cross-validation metrics, and model versions to a local JSON tracking file."""
    experiments_path = os.path.join(PipelineConfig.REPORTS_DIR, "experiments.json")
    
    # Load previous experiment history
    history = []
    if os.path.exists(experiments_path):
        try:
            with open(experiments_path, "r") as f:
                history = json.load(f)
                if not isinstance(history, list):
                    history = []
        except Exception:
            history = []
            
    # Compile new run stats
    new_run = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "model_architecture": architecture,
        "hyperparameters": hp_config,
        "metrics": {
            "test_accuracy": test_metrics.get("overall", {}).get("accuracy", 0.0),
            "test_top3_accuracy": test_metrics.get("overall", {}).get("top3_accuracy", 0.0),
            "balanced_accuracy": test_metrics.get("overall", {}).get("balanced_accuracy", 0.0),
            "mcc": test_metrics.get("overall", {}).get("mcc", 0.0),
            "cohens_kappa": test_metrics.get("overall", {}).get("cohens_kappa", 0.0),
            "calibration_ece": test_metrics.get("overall", {}).get("calibration_ece", 0.0)
        },
        "duration_minutes": duration_minutes
    }
    
    history.append(new_run)
    
    # Write back
    os.makedirs(PipelineConfig.REPORTS_DIR, exist_ok=True)
    with open(experiments_path, "w") as f:
        json.dump(history, f, indent=2)
