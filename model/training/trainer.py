import os
import time
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
from model.configs.config import PipelineConfig
from model.models.builder import build_model, setup_mixed_precision
from model.preprocessing.image import create_tf_dataset
from model.training.schedulers import OneCycleScheduler, get_cosine_decay_scheduler
from model.utils.logger import get_logger

logger = get_logger("Trainer")

def get_optimizer(name, lr):
    """Retrieve target optimizer (AdamW, Adam, SGD) with optional EMA configuration."""
    kwargs = {}
    if PipelineConfig.USE_EMA:
        # EMA is supported natively in Keras optimizers in TensorFlow 2.11+
        kwargs["use_ema"] = True
        kwargs["ema_momentum"] = PipelineConfig.EMA_MOMENTUM
        
    if name == "AdamW":
        return tf.keras.optimizers.AdamW(learning_rate=lr, weight_decay=PipelineConfig.WEIGHT_DECAY, **kwargs)
    elif name == "SGD":
        return tf.keras.optimizers.SGD(learning_rate=lr, momentum=0.9, **kwargs)
    else:
        return tf.keras.optimizers.Adam(learning_rate=lr, **kwargs)

def get_class_weights(labels):
    """Compute balanced class weights manually."""
    total_samples = len(labels)
    unique_classes = sorted(list(set(labels)))
    num_classes = len(unique_classes)
    
    class_counts = {}
    for label in labels:
        class_counts[label] = class_counts.get(label, 0) + 1
        
    class_weights = {}
    for cls in unique_classes:
        count = class_counts.get(cls, 0)
        class_weights[cls] = total_samples / (num_classes * count) if count > 0 else 1.0
        
    return class_weights

def count_model_params(model):
    """Calculate total trainable and non-trainable parameters in a model."""
    trainable_params = np.sum([np.prod(v.shape) for v in model.trainable_variables])
    non_trainable_params = np.sum([np.prod(v.shape) for v in model.non_trainable_variables])
    return int(trainable_params), int(non_trainable_params)

class CheckpointStateCallback(tf.keras.callbacks.Callback):
    def __init__(self, state_path, phase):
        super().__init__()
        self.state_path = state_path
        self.phase = phase
        
    def on_epoch_end(self, epoch, logs=None):
        state = {
            "phase": self.phase,
            "epoch": epoch + 1
        }
        try:
            with open(self.state_path, "w") as f:
                json.dump(state, f, indent=2)
        except Exception:
            pass

class PauseResumeCallback(tf.keras.callbacks.Callback):
    def __init__(self, control_file="training_control.txt", pause_at_epoch=None):
        super().__init__()
        self.control_file = control_file
        self.pause_at_epoch = pause_at_epoch
        
    def on_epoch_end(self, epoch, logs=None):
        actual_epoch = epoch + 1
        if self.pause_at_epoch and actual_epoch == self.pause_at_epoch:
            logger.info(f"Target Epoch {self.pause_at_epoch} reached. Stopping training automatically as requested.")
            self.model.stop_training = True
            try:
                with open(self.control_file, "w") as f:
                    f.write("pause")
            except Exception:
                pass
            return

        if os.path.exists(self.control_file):
            try:
                with open(self.control_file, "r") as f:
                    cmd = f.read().strip().lower()
                if cmd == "pause":
                    logger.info(f"Training pause signal detected at epoch {actual_epoch}.")
                    self.model.stop_training = True
            except Exception as e:
                logger.warning(f"Error handling pause callback: {e}")

def unfreeze_model_except_bn(model):
    """Unfreeze the model backbone, but keep BatchNormalization layers frozen to prevent training instability."""
    model.trainable = True
    for layer in model.layers:
        if isinstance(layer, tf.keras.Model) or any(x in layer.name.lower() for x in ["mobilenet", "efficientnet", "resnet", "densenet", "convnext"]):
            layer.trainable = True
            # Freeze BatchNormalization layers inside the sub-model
            for sub_layer in layer.layers:
                if isinstance(sub_layer, tf.keras.layers.BatchNormalization):
                    sub_layer.trainable = False
                elif isinstance(sub_layer, tf.keras.Model):
                    # For nested models, recursively freeze BN layers
                    for sub_sub_layer in sub_layer.layers:
                        if isinstance(sub_sub_layer, tf.keras.layers.BatchNormalization):
                            sub_sub_layer.trainable = False
            logger.info(f"Unfroze backbone model layer (with BN frozen): {layer.name}")

def train_single_fold(arch_name, fold_idx, fold_data, num_classes, hp_config, epochs, fine_tune_epochs, is_race=False):
    """Trains a single model architecture on a specific fold split."""
    logger.info(f"Training {arch_name} on Fold {fold_idx} (Race: {is_race})...")
    
    train_ds = create_tf_dataset(fold_data["train_paths"], fold_data["train_labels"], hp_config["batch_size"], augment=True, shuffle=True)
    val_ds = create_tf_dataset(fold_data["val_paths"], fold_data["val_labels"], hp_config["batch_size"], augment=False, shuffle=False)
    
    # Check if splits/reports directory exists for saving checkpoints
    checkpoint_dir = os.path.join(PipelineConfig.SAVED_MODELS_DIR, "checkpoints")
    os.makedirs(checkpoint_dir, exist_ok=True)
    state_path = os.path.join(checkpoint_dir, f"{arch_name}_fold_{fold_idx}_state.json")
    checkpoint_path_ph1 = os.path.join(checkpoint_dir, f"{arch_name}_fold_{fold_idx}_phase1.keras")
    checkpoint_path_ph2 = os.path.join(checkpoint_dir, f"{arch_name}_fold_{fold_idx}_phase2.keras")
    
    if is_race:
        state_path = os.path.join(checkpoint_dir, f"race_{arch_name}_fold_{fold_idx}_state.json")
        checkpoint_path_ph1 = os.path.join(checkpoint_dir, f"race_{arch_name}_fold_{fold_idx}_phase1.keras")
        checkpoint_path_ph2 = os.path.join(checkpoint_dir, f"race_{arch_name}_fold_{fold_idx}_phase2.keras")

    resuming = False
    state = {}
    if os.path.exists(state_path):
        try:
            with open(state_path, "r") as f:
                state = json.load(f)
            resuming = True
            logger.info(f"Found checkpoint state: {state}. Resuming fold training from checkpoint...")
        except Exception as e:
            logger.warning(f"Could not load checkpoint state: {e}")

    # Check if this fold has already completed training completely
    if not resuming and os.path.exists(checkpoint_path_ph2):
        logger.info(f"Detected completed training for {arch_name} on Fold {fold_idx}. Loading final weights directly and skipping training...")
        custom_objects = {}
        try:
            from model.models.vit import Patches, PatchEncoder
            custom_objects = {"Patches": Patches, "PatchEncoder": PatchEncoder}
        except Exception:
            pass
        model = tf.keras.models.load_model(checkpoint_path_ph2, custom_objects=custom_objects)
        return model

    # Build optimizer and loss function (used for compilation)
    optimizer = get_optimizer(hp_config["optimizer"], hp_config["learning_rate"])
    loss_fn = tf.keras.losses.CategoricalCrossentropy(label_smoothing=PipelineConfig.LABEL_SMOOTHING)

    def one_hot_map(img, label):
        return img, tf.one_hot(tf.cast(label, tf.int32), num_classes)
        
    train_ds_onehot = train_ds.map(one_hot_map, num_parallel_calls=tf.data.AUTOTUNE)
    val_ds_onehot = val_ds.map(one_hot_map, num_parallel_calls=tf.data.AUTOTUNE)
    
    # Apply class weights
    class_weights = get_class_weights(fold_data["train_labels"])

    custom_objects = {}
    try:
        from model.models.vit import Patches, PatchEncoder
        custom_objects = {"Patches": Patches, "PatchEncoder": PatchEncoder}
    except Exception:
        pass

    if resuming:
        phase = state.get("phase", 1)
        initial_epoch = state.get("epoch", 0)
        logger.info(f"Resuming Phase {phase} from epoch {initial_epoch}...")
        if phase == 2:
            if os.path.exists(checkpoint_path_ph2):
                logger.info(f"Loading Phase 2 checkpoint: {checkpoint_path_ph2}")
                model = tf.keras.models.load_model(checkpoint_path_ph2, custom_objects=custom_objects)
            elif os.path.exists(checkpoint_path_ph1):
                logger.info(f"Loading Phase 1 checkpoint to start Phase 2: {checkpoint_path_ph1}")
                model = tf.keras.models.load_model(checkpoint_path_ph1, custom_objects=custom_objects)
                unfreeze_model_except_bn(model)
                ft_optimizer = get_optimizer(hp_config["optimizer"], PipelineConfig.FINE_TUNE_LR)
                model.compile(optimizer=ft_optimizer, loss=loss_fn, metrics=["accuracy"])
            else:
                logger.warning("Checkpoint files not found. Re-building model from scratch.")
                model = build_model(arch_name, num_classes)
                unfreeze_model_except_bn(model)
                ft_optimizer = get_optimizer(hp_config["optimizer"], PipelineConfig.FINE_TUNE_LR)
                model.compile(optimizer=ft_optimizer, loss=loss_fn, metrics=["accuracy"])
        else:
            if os.path.exists(checkpoint_path_ph1):
                logger.info(f"Loading Phase 1 checkpoint: {checkpoint_path_ph1}")
                model = tf.keras.models.load_model(checkpoint_path_ph1, custom_objects=custom_objects)
            else:
                logger.warning("Checkpoint file not found. Re-building model from scratch.")
                model = build_model(arch_name, num_classes)
                model.compile(optimizer=optimizer, loss=loss_fn, metrics=["accuracy"])
    else:
        # 1. Build and configure model from scratch
        model = build_model(arch_name, num_classes)
        model.compile(optimizer=optimizer, loss=loss_fn, metrics=["accuracy"])
        phase = 1
        initial_epoch = 0

    # Setup callbacks variables
    tb_available = False
    try:
        import tensorboard
        test_writer = tf.summary.create_file_writer(os.path.join(PipelineConfig.TB_LOGS_DIR, "test_check_avail"))
        tb_available = True
    except Exception:
        tb_available = False

    # Phase 1: Train Classification Head
    if phase == 1:
        logger.info("Phase 1: Training classifier head...")
        callbacks = [
            EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True),
            ReduceLROnPlateau(monitor="val_loss", factor=0.2, patience=2, min_lr=1e-6),
        ]
        callbacks.extend([
            ModelCheckpoint(filepath=checkpoint_path_ph1, monitor="val_loss", save_best_only=True),
            CheckpointStateCallback(state_path, phase=1),
            PauseResumeCallback()
        ])
            
        from model.utils.monitor import TrainingMonitorCallback
        if is_race:
            completed_before = 0 if arch_name == "MobileNetV3" else 3
            module_name = f"Architecture Race: {arch_name} (Phase 1)"
            chk_name = "Temporary (Race)"
        else:
            completed_before = 6  # 3 + 3 from race
            module_name = f"{arch_name} (Phase 1: Classifier Head)"
            chk_name = "MobileNetV3_fold_0_phase1.keras"
            
        monitor_cb = TrainingMonitorCallback(
            current_module=module_name,
            total_epochs_in_module=epochs,
            total_pipeline_epochs=61,
            completed_epochs_before_module=completed_before,
            checkpoint_name=chk_name
        )
        callbacks.append(monitor_cb)
        
        if tb_available:
            try:
                log_dir = os.path.join(PipelineConfig.TB_LOGS_DIR, f"{arch_name}_fold_{fold_idx}")
                tb_callback = TensorBoard(log_dir=log_dir, histogram_freq=1, profile_batch="10,20")
                callbacks.append(tb_callback)
            except Exception as e:
                logger.warning(f"Could not initialize TensorBoard callback: {e}")
        else:
            logger.warning("TensorBoard is not installed or fully configured. Proceeding without TensorBoard callback.")
        
        # Setup Learning Rate scheduling
        total_steps = len(fold_data["train_paths"]) // hp_config["batch_size"] * epochs
        if PipelineConfig.LR_SCHEDULER == "onecycle":
            callbacks.append(OneCycleScheduler(max_lr=hp_config["learning_rate"], total_steps=total_steps))
        else:
            # Cosine Annealing Decay
            cos_schedule = get_cosine_decay_scheduler(hp_config["learning_rate"], total_steps)
            callbacks.append(tf.keras.callbacks.LearningRateScheduler(lambda epoch, lr: float(cos_schedule(epoch * (total_steps // epochs)))))
            
        model.fit(
            train_ds_onehot,
            validation_data=val_ds_onehot,
            epochs=epochs,
            class_weight=class_weights,
            callbacks=callbacks,
            initial_epoch=initial_epoch,
            verbose=1
        )
        
        # Reset phase for Phase 2
        phase = 2
        initial_epoch = 0
        resuming = False
        
    # Phase 2: Fine-Tuning
    if phase == 2:
        logger.info("Phase 2: Fine-tuning baseline base layers...")
        
        if not resuming or (state.get("phase", 1) == 1):
            unfreeze_model_except_bn(model)
            ft_optimizer = get_optimizer(hp_config["optimizer"], PipelineConfig.FINE_TUNE_LR)
            model.compile(
                optimizer=ft_optimizer,
                loss=loss_fn,
                metrics=["accuracy"]
            )
            
        ft_callbacks = [
            EarlyStopping(monitor="val_loss", patience=15, restore_best_weights=True),
        ]
        ft_callbacks.extend([
            ModelCheckpoint(filepath=checkpoint_path_ph2, monitor="val_loss", save_best_only=True),
            CheckpointStateCallback(state_path, phase=2),
            PauseResumeCallback()
        ])
            
        from model.utils.monitor import TrainingMonitorCallback
        monitor_cb = TrainingMonitorCallback(
            current_module=f"{arch_name} (Phase 2: Fine-Tuning)",
            total_epochs_in_module=fine_tune_epochs,
            total_pipeline_epochs=61,
            completed_epochs_before_module=6 + 15,  # 6 race + 15 phase 1
            checkpoint_name="MobileNetV3_fold_0_phase2.keras"
        )
        ft_callbacks.append(monitor_cb)
        
        if tb_available:
            try:
                log_dir = os.path.join(PipelineConfig.TB_LOGS_DIR, f"{arch_name}_fold_{fold_idx}")
                tb_callback = TensorBoard(log_dir=log_dir, histogram_freq=1, profile_batch="10,20")
                ft_callbacks.append(tb_callback)
            except Exception as e:
                logger.warning(f"Could not initialize TensorBoard callback for Fine-Tuning: {e}")
                
        model.fit(
            train_ds_onehot,
            validation_data=val_ds_onehot,
            epochs=fine_tune_epochs,
            class_weight=class_weights,
            callbacks=ft_callbacks,
            initial_epoch=initial_epoch,
            verbose=1
        )
        
    # Clean up checkpoint state file on completion
    if not is_race and os.path.exists(state_path) and not getattr(model, "stop_training", False):
        try:
            os.remove(state_path)
            logger.info("Training finished. Cleared checkpoint state file.")
        except Exception as e:
            logger.warning(f"Could not remove checkpoint state file: {e}")
            
    return model

def run_pipeline_training(all_classes, hp_config):
    """
    Coordinates model selection on Fold 0 followed by 
    5-Fold Stratified Cross-Validation on the optimal architecture.
    """
    setup_mixed_precision()
    num_classes = len(all_classes)
    os.makedirs(PipelineConfig.SAVED_MODELS_DIR, exist_ok=True)
    
    # Load Fold 0 data for baseline comparison
    with open(os.path.join(PipelineConfig.FOLDS_DIR, "fold_0_split.json"), "r") as f:
        fold_0 = json.load(f)
        
    logger.info("Running baseline architectures comparison on Fold 0...")
    comparison_results = {}
    
    # --- RESUME GUARD: Skip race entirely if comparison report already saved ---
    os.makedirs(PipelineConfig.REPORTS_DIR, exist_ok=True)
    comp_report_path = os.path.join(PipelineConfig.REPORTS_DIR, "model_comparison_report.json")
    if os.path.exists(comp_report_path):
        logger.info("Found existing model comparison report. Skipping architecture race — loading cached results...")
        try:
            with open(comp_report_path, "r") as f:
                comparison_results = json.load(f)
            logger.info(f"Loaded cached race results: {list(comparison_results.keys())}")
        except Exception as e:
            logger.warning(f"Could not load comparison report: {e}. Re-running race...")
            comparison_results = {}
    
    if not comparison_results:
        for arch in PipelineConfig.ARCHITECTURES:
            logger.info(f"\nEvaluating: {arch}...")
            try:
                start_time = time.time()
                # Run short architecture race (3 epochs Phase 1, 0 epochs Phase 2)
                model = train_single_fold(
                    arch, 
                    fold_idx=0, 
                    fold_data=fold_0, 
                    num_classes=num_classes, 
                    hp_config=hp_config, 
                    epochs=3, 
                    fine_tune_epochs=0,
                    is_race=True
                )
                elapsed = time.time() - start_time
                
                # Evaluate metrics on Fold 0 validation
                val_ds = create_tf_dataset(fold_0["val_paths"], fold_0["val_labels"], hp_config["batch_size"], augment=False, shuffle=False)
                
                # Latency benchmark
                dummy_input = np.random.rand(1, 224, 224, 3).astype(np.float32)
                # Warm up
                _ = model(dummy_input, training=False)
                
                inf_start = time.time()
                for _ in range(50):
                    _ = model(dummy_input, training=False)
                inf_elapsed = (time.time() - inf_start) / 50.0 * 1000.0 # Latency in ms
                
                if len(fold_0["val_labels"]) > 0:
                    pred_probs = model.predict(val_ds, verbose=0)
                    val_acc = np.mean(np.argmax(pred_probs, axis=1) == fold_0["val_labels"])
                else:
                    val_acc = 0.0
                
                # Parameters count
                trainable_params, non_trainable_params = count_model_params(model)
                
                # Temporary save path to measure size
                temp_path = os.path.join(PipelineConfig.SAVED_MODELS_DIR, "temp_size_check.keras")
                model.save(temp_path)
                model_size = os.path.getsize(temp_path) / (1024 * 1024) if os.path.exists(temp_path) else 0.0
                if os.path.exists(temp_path): os.remove(temp_path)
                
                comparison_results[arch] = {
                    "val_accuracy": float(val_acc),
                    "latency_ms": float(inf_elapsed),
                    "fps": float(1000.0 / inf_elapsed),
                    "model_size_mb": float(model_size),
                    "trainable_parameters": trainable_params,
                    "duration_seconds": elapsed
                }
                logger.info(f"Finished {arch}. Accuracy: {val_acc:.4f}, Latency: {inf_elapsed:.1f}ms")
                
            except Exception as e:
                logger.error(f"Error training {arch} on Fold 0: {e}")
                import traceback
                traceback.print_exc()
                continue
                
        # Save comparison report
        with open(comp_report_path, "w") as f:
            json.dump(comparison_results, f, indent=2)
        
    # Smart Selector Algorithm (Rank based on score = val_accuracy - 0.1 * log(model_size_mb) - 0.05 * latency_ms/10)
    best_arch = None
    best_score = -1e9
    for arch, metrics in comparison_results.items():
        score = metrics["val_accuracy"] - 0.05 * np.log(max(1.0, metrics["model_size_mb"])) - 0.02 * (metrics["latency_ms"] / 10.0)
        if score > best_score:
            best_score = score
            best_arch = arch
            
    logger.info(f"--> Smart selection completed. Selected best overall architecture: {best_arch}")
    
    # 5-Fold Stratified Cross-Validation on selected best architecture
    logger.info(f"Running full 1-Fold Validation on: {best_arch}...")
    fold_accuracies = []
    best_fold_model = None
    best_fold_acc = 0.0
    
    for f_idx in range(1):
        logger.info(f"--- TRAINING fold {f_idx}/1 ---")
        with open(os.path.join(PipelineConfig.FOLDS_DIR, f"fold_{f_idx}_split.json"), "r") as f:
            f_data = json.load(f)
            
        model = train_single_fold(
            best_arch, 
            fold_idx=f_idx, 
            fold_data=f_data, 
            num_classes=num_classes, 
            hp_config=hp_config,
            epochs=PipelineConfig.EPOCHS,
            fine_tune_epochs=PipelineConfig.FINE_TUNE_EPOCHS,
            is_race=False
        )
        
        # Evaluate fold val accuracy
        val_ds = create_tf_dataset(f_data["val_paths"], f_data["val_labels"], hp_config["batch_size"], augment=False, shuffle=False)
        if len(f_data["val_labels"]) > 0:
            pred_probs = model.predict(val_ds, verbose=0)
            val_acc = np.mean(np.argmax(pred_probs, axis=1) == f_data["val_labels"])
        else:
            val_acc = 0.0
        fold_accuracies.append(float(val_acc))
        logger.info(f"Fold {f_idx} validation accuracy: {val_acc:.4f}")
        
        if val_acc > best_fold_acc:
            best_fold_acc = val_acc
            best_fold_model = model
            
    # Save best fold weights as final model
    if best_fold_model:
        best_fold_model.save(PipelineConfig.BEST_MODEL_PATH)
        logger.info(f"Saved best fold model to production path: {PipelineConfig.BEST_MODEL_PATH}")
        
    # Generate fold comparison reports
    cv_report = {
        "architecture": best_arch,
        "fold_accuracies": fold_accuracies,
        "mean_accuracy": float(np.mean(fold_accuracies)),
        "std_accuracy": float(np.std(fold_accuracies))
    }
    
    cv_report_path = os.path.join(PipelineConfig.REPORTS_DIR, "cross_validation_report.json")
    with open(cv_report_path, "w") as f:
        json.dump(cv_report, f, indent=2)
        
    logger.info(f"5-Fold CV Report saved at: {cv_report_path}")
    logger.info(f"CV Metrics: Mean Acc: {cv_report['mean_accuracy']:.4f} +/- {cv_report['std_accuracy']:.4f}")
    
    return best_arch, cv_report
