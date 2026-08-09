import os
import json
import time
import random
import tensorflow as tf
from model.configs.config import PipelineConfig
from model.models.builder import build_model
from model.preprocessing.image import create_tf_dataset
from model.utils.logger import get_logger

logger = get_logger("Tuner")

def run_hyperparameter_search(train_paths, train_labels, val_paths, val_labels, num_classes):
    """
    Performs a randomized hyperparameter sweep over learning rates, dropout, optimizers, 
    and batch sizes, generating a structured report.
    """
    logger.info("Starting hyperparameter tuning sweep...")
    
    # Tuning Space
    lr_choices = [1e-4, 1e-3, 1e-2]
    dropout_choices = [0.2, 0.3, 0.4]
    optimizer_choices = ["AdamW", "Adam", "SGD"]
    batch_choices = [16, 32]
    
    # Subsample dataset for fast search runs (10% subset)
    random.seed(PipelineConfig.SEED)
    subset_size = max(50, int(len(train_paths) * 0.1))
    indices = random.sample(range(len(train_paths)), subset_size)
    tune_paths = [train_paths[i] for i in indices]
    tune_labels = [train_labels[i] for i in indices]
    
    results = []
    best_trial = None

    try:
        import optuna
        logger.info("Optuna detected. Running Optuna-based Bayesian hyperparameter optimization search...")
        optuna.logging.set_verbosity(optuna.logging.WARNING)

        # Map labels to one-hot inside the dataset to match classification predictions
        def one_hot_map(img, label):
            return img, tf.one_hot(tf.cast(label, tf.int32), num_classes)

        def objective(trial):
            lr = trial.suggest_float("learning_rate", 1e-4, 1e-2, log=True)
            dropout = trial.suggest_float("dropout_rate", 0.2, 0.4)
            opt_name = trial.suggest_categorical("optimizer", ["AdamW", "Adam", "SGD"])
            batch = trial.suggest_categorical("batch_size", [16, 32])

            train_ds = create_tf_dataset(tune_paths, tune_labels, batch, augment=True, shuffle=True)
            val_ds = create_tf_dataset(val_paths[:50], val_labels[:50], batch, augment=False, shuffle=False)
            
            # Map datasets to categorical
            train_ds_onehot = train_ds.map(one_hot_map, num_parallel_calls=tf.data.AUTOTUNE)
            val_ds_onehot = val_ds.map(one_hot_map, num_parallel_calls=tf.data.AUTOTUNE)

            model = build_model("MobileNetV3", num_classes)
            if opt_name == "AdamW":
                optimizer = tf.keras.optimizers.AdamW(learning_rate=lr, weight_decay=PipelineConfig.WEIGHT_DECAY)
            elif opt_name == "SGD":
                optimizer = tf.keras.optimizers.SGD(learning_rate=lr, momentum=0.9)
            else:
                optimizer = tf.keras.optimizers.Adam(learning_rate=lr)

            loss_fn = tf.keras.losses.CategoricalCrossentropy(label_smoothing=PipelineConfig.LABEL_SMOOTHING)
            model.compile(optimizer=optimizer, loss=loss_fn, metrics=["accuracy"])
            
            history = model.fit(
                train_ds_onehot,
                validation_data=val_ds_onehot,
                epochs=1,
                verbose=0
            )
            val_loss = float(history.history["val_loss"][-1])
            val_acc = float(history.history["val_accuracy"][-1])
            
            results.append({
                "trial": len(results) + 1,
                "learning_rate": lr,
                "dropout_rate": dropout,
                "optimizer": opt_name,
                "batch_size": batch,
                "val_accuracy": val_acc,
                "val_loss": val_loss
            })
            return val_loss

        study = optuna.create_study(direction="minimize")
        study.optimize(objective, n_trials=5)
        
        best_params = study.best_params
        best_trial = {
            "learning_rate": best_params["learning_rate"],
            "dropout_rate": best_params["dropout_rate"],
            "optimizer": best_params["optimizer"],
            "batch_size": best_params["batch_size"]
        }
        
    except ImportError:
        logger.warning("Optuna is not installed. Falling back to the randomized hyperparameter search...")
        # Run 3 random trials
        random.seed(time.time())
        lr_choices = [1e-4, 1e-3, 1e-2]
        dropout_choices = [0.2, 0.3, 0.4]
        optimizer_choices = ["AdamW", "Adam", "SGD"]
        batch_choices = [16, 32]

        def one_hot_map(img, label):
            return img, tf.one_hot(tf.cast(label, tf.int32), num_classes)

        for trial in range(3):
            lr = random.choice(lr_choices)
            dropout = random.choice(dropout_choices)
            opt_name = random.choice(optimizer_choices)
            batch = random.choice(batch_choices)
            
            logger.info(f"Trial {trial+1}/3: Learning Rate: {lr}, Dropout: {dropout}, Optimizer: {opt_name}, Batch Size: {batch}")
            
            try:
                train_ds = create_tf_dataset(tune_paths, tune_labels, batch, augment=True, shuffle=True)
                val_ds = create_tf_dataset(val_paths[:50], val_labels[:50], batch, augment=False, shuffle=False)
                
                train_ds_onehot = train_ds.map(one_hot_map, num_parallel_calls=tf.data.AUTOTUNE)
                val_ds_onehot = val_ds.map(one_hot_map, num_parallel_calls=tf.data.AUTOTUNE)

                model = build_model("MobileNetV3", num_classes)
                if opt_name == "AdamW":
                    optimizer = tf.keras.optimizers.AdamW(learning_rate=lr, weight_decay=PipelineConfig.WEIGHT_DECAY)
                elif opt_name == "SGD":
                    optimizer = tf.keras.optimizers.SGD(learning_rate=lr, momentum=0.9)
                else:
                    optimizer = tf.keras.optimizers.Adam(learning_rate=lr)
                    
                loss_fn = tf.keras.losses.CategoricalCrossentropy(label_smoothing=PipelineConfig.LABEL_SMOOTHING)
                model.compile(optimizer=optimizer, loss=loss_fn, metrics=["accuracy"])
                
                start_time = time.time()
                history = model.fit(
                    train_ds_onehot,
                    validation_data=val_ds_onehot,
                    epochs=1,
                    verbose=0
                )
                elapsed = time.time() - start_time
                
                val_acc = float(history.history["val_accuracy"][-1])
                val_loss = float(history.history["val_loss"][-1])
                
                results.append({
                    "trial": trial + 1,
                    "learning_rate": lr,
                    "dropout_rate": dropout,
                    "optimizer": opt_name,
                    "batch_size": batch,
                    "val_accuracy": val_acc,
                    "val_loss": val_loss,
                    "duration_seconds": elapsed
                })
                logger.info(f"Trial {trial+1} complete. Val Accuracy: {val_acc:.4f}, Duration: {elapsed:.1f}s")
            except Exception as e:
                logger.error(f"Error during hyperparameter tuning trial {trial+1}: {e}")
                continue
                
        best_trial = max(results, key=lambda x: x["val_accuracy"]) if results else {
            "learning_rate": PipelineConfig.LEARNING_RATE,
            "dropout_rate": 0.3,
            "optimizer": PipelineConfig.OPTIMIZER,
            "batch_size": PipelineConfig.BATCH_SIZE
        }
        
    tuning_report = {
        "tuning_results": results,
        "best_hyperparameters": best_trial
    }
    
    # Save Report
    os.makedirs(PipelineConfig.REPORTS_DIR, exist_ok=True)
    report_path = os.path.join(PipelineConfig.REPORTS_DIR, "hyperparameter_tuning_report.json")
    with open(report_path, "w") as f:
        json.dump(tuning_report, f, indent=2)
        
    logger.info(f"Tuning report successfully saved to: {report_path}")
    logger.info(f"Optimal Hyperparameters: {best_trial}")
    return best_trial
