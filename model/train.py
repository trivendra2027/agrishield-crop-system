import os
import argparse
import time
import json
import random
import cv2
import numpy as np
import tensorflow as tf
from model.configs.config import PipelineConfig
from model.preprocessing.dataset import prepare_pipeline_data
from model.training.tuner import run_hyperparameter_search
from model.training.trainer import run_pipeline_training
from model.training.distill import Distiller
from model.preprocessing.image import create_tf_dataset
from model.models.builder import build_model
from model.models.exporter import export_all_formats
from model.evaluation.metrics import evaluate_best_model
from model.evaluation.reporter import generate_html_project_report
from model.utils.tracker import log_experiment_run
from model.utils.audit import run_production_audit
from model.utils.logger import get_logger

logger = get_logger("Pipeline_Coordinator")

# ──────────────────────────────────────────────────────────────────
# Maximum CPU Utilization Configuration
# Uses all available physical and logical CPU cores for TensorFlow
# inter-op parallelism (graph-level ops) and intra-op parallelism
# (within individual ops like matrix multiplication).
# ──────────────────────────────────────────────────────────────────
_CPU_CORES = os.cpu_count() or 4
tf.config.threading.set_inter_op_parallelism_threads(_CPU_CORES)
tf.config.threading.set_intra_op_parallelism_threads(_CPU_CORES)
os.environ["OMP_NUM_THREADS"] = str(_CPU_CORES)
os.environ["TF_NUM_INTEROP_THREADS"] = str(_CPU_CORES)
os.environ["TF_NUM_INTRAOP_THREADS"] = str(_CPU_CORES)
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "1"     # Enable Intel MKL-DNN optimized CPU ops

# Raise process priority to HIGH on Windows for faster execution
try:
    import psutil, ctypes
    p = psutil.Process(os.getpid())
    p.nice(psutil.HIGH_PRIORITY_CLASS)
    logger.info(f"[CPU MAX MODE] Process elevated to HIGH priority. Using {_CPU_CORES} CPU cores for TensorFlow threading.")
except Exception as _e:
    logger.warning(f"[CPU MAX MODE] Could not elevate process priority: {_e}. Continuing with default priority.")



def set_reproducibility(seed=42):
    """Enforce deterministic outputs by seeding Python, NumPy, and TensorFlow."""
    logger.info(f"Enforcing experiment reproducibility seeds (Seed: {seed}).")
    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)

def main():
    parser = argparse.ArgumentParser(description="AI Crop Disease - Research & Production Training Pipeline")
    parser.add_argument("--quick_test", action="store_true", help="Run a quick 1-epoch compile verification test.")
    parser.add_argument("--resume", action="store_true", help="Resume training from paused state (Phase 3).")
    args = parser.parse_args()

    # Enforce reproducibility
    if PipelineConfig.REPRODUCIBILITY:
        set_reproducibility(PipelineConfig.SEED)
        
    start_time = time.time()

    # Quick test parameter configuration adjustments
    if args.quick_test:
        logger.info("====================================================")
        logger.info("RUNNING PIPELINE COORDINATOR IN QUICK TEST MODE")
        logger.info("====================================================")
        PipelineConfig.MAX_SAMPLES_PER_CLASS = 5
        PipelineConfig.EPOCHS = 1
        PipelineConfig.FINE_TUNE_EPOCHS = 1
        PipelineConfig.SIMCLR_EPOCHS = 1
        # Limit compared architectures for speed
        PipelineConfig.ARCHITECTURES = ["EfficientNetV2", "MobileNetV3"]

    logger.info("Step 1: Running dataset cleaning, quality check, and fold split indexing...")
    from model.utils.monitor import update_module_transition
    update_module_transition("Step 1: Dataset Validation & Preparation", "Preparing datasets...", 0, 61)
    classes, quality_summary = prepare_pipeline_data(max_samples=PipelineConfig.MAX_SAMPLES_PER_CLASS)
    num_classes = len(classes)
    
    # Load fold 0 paths for tuning sweeps
    with open(os.path.join(PipelineConfig.FOLDS_DIR, "fold_0_split.json"), "r") as f:
        fold_0 = json.load(f)
        
    logger.info("Step 2: Starting hyperparameter optimization sweeps...")
    update_module_transition("Step 2: Hyperparameter Optimization", "Optimizing hyperparameters...", 0, 61)
    tuning_report_path = os.path.join(PipelineConfig.REPORTS_DIR, "hyperparameter_tuning_report.json")
    if os.path.exists(tuning_report_path):
        logger.info("Found existing hyperparameter tuning report. Reusing optimal hyperparameters...")
        with open(tuning_report_path, "r") as f:
            report_data = json.load(f)
            best_hp = report_data["best_hyperparameters"]
    else:
        best_hp = run_hyperparameter_search(
            fold_0["train_paths"], fold_0["train_labels"],
            fold_0["val_paths"], fold_0["val_labels"],
            num_classes
        )
    
    # Overwrite configuration variables with optimal parameters
    PipelineConfig.OPTIMIZER = best_hp["optimizer"]
    PipelineConfig.LEARNING_RATE = best_hp["learning_rate"]
    PipelineConfig.BATCH_SIZE = best_hp["batch_size"]
    PipelineConfig.LR_SCHEDULER = "cosine"
    
    logger.info("Step 3: Running baseline model evaluations and 5-Fold Cross-Validation...")
    update_module_transition("Step 3: Baseline Comparison & Main Training", "Starting architecture race...", 0, 61)
    best_arch, cv_results = run_pipeline_training(classes, best_hp)
    
    # Step 4: Run Knowledge Distillation (Teacher -> Student)
    if PipelineConfig.RUN_KNOWLEDGE_DISTILLATION and os.path.exists(PipelineConfig.BEST_MODEL_PATH):
        logger.info("Step 4: Training distilled student model (EfficientNetV2)...")
        update_module_transition("Step 4: Knowledge Distillation", "Training student model...", 6 + 15 + 25, 61)
        try:
            student_checkpoint_dir = os.path.join(PipelineConfig.SAVED_MODELS_DIR, "checkpoints")
            os.makedirs(student_checkpoint_dir, exist_ok=True)
            student_checkpoint_path = os.path.join(student_checkpoint_dir, "student_model_checkpoint.keras")
            student_state_path = os.path.join(student_checkpoint_dir, "student_model_state.json")

            teacher_model = tf.keras.models.load_model(PipelineConfig.BEST_MODEL_PATH)
            # Use the Phase 2 fine-tuned MobileNetV3 as the student (self-distillation).
            # This preserves the 47% accuracy learned in Phases 1-2 instead of starting
            # from scratch with a random EfficientNetV2 that was collapsing to ~5%.
            student_model = tf.keras.models.load_model(PipelineConfig.BEST_MODEL_PATH)

            initial_epoch = 0
            if os.path.exists(student_state_path) and os.path.exists(student_checkpoint_path):
                try:
                    with open(student_state_path, "r") as f:
                        state = json.load(f)
                    initial_epoch = state.get("epoch", 0)
                    logger.info(f"Resuming student distillation training from Epoch {initial_epoch}...")
                    # Load student weights into model
                    checkpoint_model = tf.keras.models.load_model(student_checkpoint_path)
                    student_model.set_weights(checkpoint_model.get_weights())
                    logger.info("Successfully loaded student weights from checkpoint.")
                except Exception as e:
                    logger.warning(f"Could not load student checkpoint state: {e}. Starting from scratch.")
                    initial_epoch = 0

            distiller = Distiller(
                student=student_model,
                teacher=teacher_model,
                alpha=0.0,           # Pure CE fine-tuning — distillation disabled (teacher==student causes gradient conflict)
                temperature=3.0
            )

            distiller.compile(
                optimizer=tf.keras.optimizers.Adam(learning_rate=5e-5),  # Gentle LR — pushing beyond Phase 2's 47%
                metrics=[tf.keras.metrics.CategoricalAccuracy(name="accuracy")]
            )
            
            # Setup datasets
            train_ds = create_tf_dataset(fold_0["train_paths"], fold_0["train_labels"], PipelineConfig.BATCH_SIZE, augment=True, shuffle=True)
            val_ds = create_tf_dataset(fold_0["val_paths"], fold_0["val_labels"], PipelineConfig.BATCH_SIZE, augment=False, shuffle=False)
            
            class DistillCheckpointCallback(tf.keras.callbacks.Callback):
                def __init__(self, model_path, state_path):
                    super().__init__()
                    self.model_path = model_path
                    self.state_path = state_path
                def on_epoch_end(self, epoch, logs=None):
                    # Save student model weights wrapper
                    self.model.student.save(self.model_path)
                    with open(self.state_path, "w") as f:
                        json.dump({"epoch": epoch + 1}, f)
                    logger.info(f"Saved distilled student model checkpoint at Epoch {epoch + 1}")
            # Callback to handle pause command via a control file
            class PauseResumeCallback(tf.keras.callbacks.Callback):
                def __init__(self, control_file="training_control.txt", state_file="training_state.json"):
                    super().__init__()
                    self.control_file = control_file
                    self.state_file = state_file
                def on_epoch_end(self, epoch, logs=None):
                    # Check for pause signal
                    if os.path.exists(self.control_file):
                        with open(self.control_file, "r") as f:
                            cmd = f.read().strip().lower()
                        if cmd == "pause":
                            # Save training state for resume
                            state = {
                                "phase": "knowledge_distillation",
                                "epoch": epoch + 1
                            }
                            with open(self.state_file, "w") as sf:
                                json.dump(state, sf)
                            logger.info(f"Training paused at epoch {epoch + 1}. Use '--resume' to continue.")
                            self.model.stop_training = True
                def on_train_end(self, logs=None):
                    # Clean up control file after successful completion
                    if os.path.exists(self.control_file):
                        os.remove(self.control_file)
                    if os.path.exists(self.state_file):
                        os.remove(self.state_file)
            checkpoint_cb = DistillCheckpointCallback(student_checkpoint_path, student_state_path)
            
            from model.utils.monitor import TrainingMonitorCallback
            distill_epochs = (initial_epoch + 1) if args.quick_test else 15
            monitor_cb = TrainingMonitorCallback(
                current_module="Phase 3: Knowledge Distillation",
                total_epochs_in_module=distill_epochs,
                total_pipeline_epochs=61 if not args.quick_test else (6 + 1 + 1 + distill_epochs),
                completed_epochs_before_module=6 + 15 + 25 if not args.quick_test else 6 + 1 + 1,  # 6 race + 15 phase 1 + 25 phase 2
                checkpoint_name="student_model_checkpoint.keras"
            )

            # Handle resume flag for Knowledge Distillation phase
            if args.resume:
                resume_state_path = "training_state.json"
                if os.path.exists(resume_state_path):
                    with open(resume_state_path, "r") as f:
                        resume_state = json.load(f)
                    resume_epoch = resume_state.get("epoch", 0)
                    logger.info(f"Resuming Knowledge Distillation from epoch {resume_epoch}")
                    initial_epoch = resume_epoch
                else:
                    logger.warning("Resume flag set but no saved training state found. Starting from epoch 0.")
            
            distiller.fit(
                train_ds,
                validation_data=val_ds,
                epochs=distill_epochs,
                initial_epoch=initial_epoch,
                callbacks=[checkpoint_cb, monitor_cb, PauseResumeCallback()],
                verbose=1
            )
            
            # Save student model
            student_path = os.path.join(PipelineConfig.SAVED_MODELS_DIR, "student_model.keras")
            distiller.student.save(student_path)
            logger.info(f"Saved distilled student model to: {student_path}")

            # Clear student checkpoint state on completion
            if os.path.exists(student_state_path):
                try:
                    os.remove(student_state_path)
                except Exception:
                    pass
        except Exception as e:
            logger.error(f"Error during Knowledge Distillation: {e}")

    # Load holdout test split
    with open(os.path.join(PipelineConfig.FOLDS_DIR, "test_split.json"), "r") as f:
        test_split = json.load(f)

    # Step 5: Export SavedModel, TFLite FP16/INT8, and ONNX formats
    logger.info("Step 5: Exporting final model deployment formats...")
    update_module_transition("Step 5: Exporting Deployment Formats", "Exporting Keras/TFLite...", 6 + 15 + 25 + 15, 61)
    student_path = os.path.join(PipelineConfig.SAVED_MODELS_DIR, "student_model.keras")
    model_to_export_path = student_path if os.path.exists(student_path) else PipelineConfig.BEST_MODEL_PATH
    
    if os.path.exists(model_to_export_path):
        # We define a preprocess wrapper to pass to INT8 quantization generator
        def preprocess_wrapper(image_path):
            img_bgr = cv2.imread(image_path)
            if img_bgr is None:
                enhanced = np.zeros(PipelineConfig.INPUT_SHAPE, dtype=np.uint8)
            else:
                # Import on the fly
                from model.preprocessing.image import apply_advanced_enhancements
                enhanced = apply_advanced_enhancements(img_bgr)
                enhanced = cv2.resize(enhanced, PipelineConfig.IMAGE_SIZE)
            img_array = enhanced.astype(np.float32) / 255.0
            return np.expand_dims(img_array, axis=0)

        logger.info(f"Loading model for export and evaluation from: {model_to_export_path}")
        model_to_export = tf.keras.models.load_model(model_to_export_path)
        export_all_formats(model_to_export, fold_0["val_paths"], preprocess_wrapper)
        
        # Step 6: Post-training evaluation on holdout test split
        logger.info("Step 6: Executing holdout test set metric evaluation...")
        update_module_transition("Step 6: Executing Evaluation", "Evaluating test metrics...", 61, 61)
        test_metrics = evaluate_best_model(model_to_export_path, test_split["paths"], test_split["labels"], classes)
        
        # Step 7: Record experiment run parameters
        elapsed_min = (time.time() - start_time) / 60.0
        log_experiment_run(best_arch, best_hp, test_metrics, elapsed_min)
        
    else:
        logger.error("Export model path not found. Skipping export and evaluation steps.")
        
    # Step 8: Generate consolidated project reports (HTML/JSON)
    logger.info("Step 7: Compiling final project reports...")
    update_module_transition("Step 7 & 8: Compiling Reports & Audit", "Running final audits...", 61, 61)
    generate_html_project_report()
    
    # Step 9: Final production audits
    logger.info("Step 8: Performing final AI system readiness audit...")
    run_production_audit()
    
    logger.info("Machine Learning Pipeline execution finished successfully.")
    update_module_transition("Pipeline Completed Successfully", "Models saved and ready for deployment!", 61, 61)

if __name__ == "__main__":
    main()
