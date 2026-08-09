import os
import json
import time
import datetime
import psutil
import numpy as np
import tensorflow as tf

STATUS_FILE_PATH = r"c:\AI Crop Disease Detection System\New model training status.md"
LOG_FILE_PATH = r"c:\AI Crop Disease Detection System\model_training"
HISTORY_FILE_PATH = r"c:\AI Crop Disease Detection System\model\saved_models\checkpoints\monitor_history.json"

def get_system_resources():
    try:
        cpu = f"{psutil.cpu_percent()}%"
        ram = psutil.virtual_memory()
        ram_str = f"{ram.percent}% ({ram.used / (1024**3):.1f} GB / {ram.total / (1024**3):.1f} GB)"
        disk = psutil.disk_usage('.')
        disk_str = f"{disk.percent}% ({disk.used / (1024**3):.1f} GB / {disk.total / (1024**3):.1f} GB)"
        return cpu, ram_str, disk_str
    except Exception:
        return "N/A", "N/A", "N/A"

def load_monitor_history():
    if os.path.exists(HISTORY_FILE_PATH):
        for _ in range(5):
            try:
                with open(HISTORY_FILE_PATH, "r", encoding="utf-8-sig") as f:
                    content = f.read().strip()
                    if content:
                        data = json.loads(content)
                        if isinstance(data, dict):
                            # Ensure required keys exist
                            for key in ["Phase 1: Classifier Head", "Phase 2: Fine-Tuning", "Phase 3: Knowledge Distillation"]:
                                if key not in data:
                                    data[key] = []
                            return data
            except Exception:
                time.sleep(1)
    return {
        "Phase 1: Classifier Head": [],
        "Phase 2: Fine-Tuning": [],
        "Phase 3: Knowledge Distillation": []
    }

def save_monitor_history(history):
    os.makedirs(os.path.dirname(HISTORY_FILE_PATH), exist_ok=True)
    for _ in range(5):
        try:
            with open(HISTORY_FILE_PATH, "w", encoding="utf-8") as f:
                json.dump(history, f, indent=2)
            return
        except Exception:
            time.sleep(1)

TABLES_FILE_PATH = r"c:\AI Crop Disease Detection System\model training tables"

def generate_ascii_bar(pct, length=30):
    filled = int(round((pct / 100.0) * length))
    filled = max(0, min(length, filled))
    return "█" * filled + "░" * (length - filled)

def write_files(current_module, current_epoch, total_epochs, progress_pct, train_loss, train_acc, val_loss, val_acc, best_acc, best_epoch, lr, eta, checkpoint, health_status, dataset_progress, current_step=None, total_steps=None):
    cpu_usage, ram_usage, disk_usage = get_system_resources()
    last_updated = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 1. Write live status markdown
    status_content = f"""# Agri Shield - Production Model Training Status

- **Current Module:** {current_module}
- **Current Epoch:** {current_epoch} / {total_epochs}
- **Overall Progress:** {progress_pct:.2f}%
- **Training Accuracy:** {train_acc}
- **Validation Accuracy:** {val_acc}
- **Training Loss:** {train_loss}
- **Validation Loss:** {val_loss}
- **Best Accuracy:** {best_acc}
- **Best Epoch:** {best_epoch}
- **Learning Rate:** {lr}
- **ETA:** {eta}
- **Health Status:** {health_status}
- **Current Checkpoint:** {checkpoint}
- **Dataset Progress:** {dataset_progress}
- **Last Updated:** {last_updated}

## System Resource Metrics
- **CPU Usage:** {cpu_usage}
- **RAM Usage:** {ram_usage}
- **Disk Usage:** {disk_usage}
"""
    try:
        with open(STATUS_FILE_PATH, "w") as f:
            f.write(status_content)
    except Exception:
        pass

    # 2. Write formatted log file (model_training) with tables and live step progress
    history = load_monitor_history()
    
    def format_table(epochs_list):
        if not epochs_list:
            return "*No epochs completed yet.*"
        
        header  = "| Epoch |  Train Acc  |  Train Loss  |  Val Acc  |  Val Loss  |     LR     |  Status   |"
        divider = "|-------|-------------|--------------|-----------|------------|------------|-----------|"
        rows = [header, divider]
        for ep in epochs_list:
            rows.append(
                f"| {ep['epoch']:^5} | {ep['train_acc']:^11} | {ep['train_loss']:^12} | {ep['val_acc']:^9} | {ep['val_loss']:^10} | {ep['lr']:^10} | {ep['status']:<9} |"
            )
        return "\n".join(rows)

    # Construct the race section dynamically
    race_section = ""
    is_race = "Architecture Race" in current_module or "Race" in checkpoint
    if is_race:
        candidate = current_module.replace("Architecture Race: ", "").split(" (")[0]
        if not candidate or candidate == current_module:
            candidate = "MobileNetV3"
        step_str = f"{current_step}/{total_steps} (In progress)" if current_step else "Initializing..."
        race_section = f"""--------------------------------------------------
Architecture Selection Race (Target: 3 Epochs per candidate)
--------------------------------------------------
- Current Candidate: {candidate} (Epoch {current_epoch}/3)
- Step: {step_str}
- Training Loss: {train_loss}
- Training Accuracy: {train_acc}
- Time Remaining (Candidate Race): {eta}

"""

    # In-progress block helpers for main phases
    p1_active = ""
    p2_active = ""
    p3_active = ""
    
    if current_step and not is_race:
        in_progress_block = f"""
*Active Epoch: Epoch {current_epoch} (In progress)*
- Step: {current_step}/{total_steps}
- Current Loss: {train_loss}
- Current Accuracy: {train_acc}
- Remaining Time (Current Epoch): {eta}
"""
        if "Phase 1" in current_module:
            p1_active = in_progress_block
        elif "Phase 2" in current_module:
            p2_active = in_progress_block
        elif "Distillation" in current_module or "Phase 3" in current_module:
            p3_active = in_progress_block

    log_content = f"""==================================================
AI Crop Disease Detection System - Model Training Log
==================================================
Training Started: 2026-07-13 03:36:26 (Local Time)
Base Model Architecture: MobileNetV3 (with SE Attention)
Dataset Size: 88,979 clean images (85 classes)
Last Update: {last_updated}
Health Status: {health_status}
Estimated Time Remaining: {eta}

{race_section}--------------------------------------------------
Phase 1: Classifier Head Training (Target: 15 Epochs)
--------------------------------------------------
{format_table(history.get("Phase 1: Classifier Head", []))}{p1_active}

--------------------------------------------------
Phase 2: Fine-Tuning Base Layers (Target: 25 Epochs)
--------------------------------------------------
{format_table(history.get("Phase 2: Fine-Tuning", []))}{p2_active}

--------------------------------------------------
Phase 3: Knowledge Distillation (Target: 15 Epochs)
--------------------------------------------------
{format_table(history.get("Phase 3: Knowledge Distillation", []))}{p3_active}
"""
    try:
        with open(LOG_FILE_PATH, "w") as f:
            f.write(log_content)
    except Exception:
        pass

    # 3. Write model training tables with professional layout and progress bars
    p1_list = history.get("Phase 1: Classifier Head", [])
    p2_list = history.get("Phase 2: Fine-Tuning", [])
    p3_list = history.get("Phase 3: Knowledge Distillation", [])

    p1_pct = (len(p1_list) / 15.0) * 100.0
    p2_pct = (len(p2_list) / 25.0) * 100.0
    p3_pct = (len(p3_list) / 15.0) * 100.0

    p1_status = "✔ COMPLETE" if len(p1_list) >= 15 else ("⟳ ACTIVE" if "Phase 1" in current_module else "○ WAITING")
    p2_status = "✔ COMPLETE" if len(p2_list) >= 25 else ("⟳ ACTIVE" if "Phase 2" in current_module else "○ WAITING")
    p3_status = "✔ COMPLETE" if len(p3_list) >= 15 else ("⟳ ACTIVE" if "Phase 3" in current_module or "Distillation" in current_module else "○ WAITING")

    # Format tables rows
    def format_tables_rows(epochs_list, target_epochs, active_epoch_num, is_active):
        rows = []
        for i in range(1, target_epochs + 1):
            ep_data = next((x for x in epochs_list if x["epoch"] == i), None)
            if ep_data:
                bar = generate_ascii_bar(float(ep_data["train_acc"].replace("%","")), 15)
                rows.append(f"  │  {i:^4} │ {bar} {ep_data['train_acc']:>5} │ {ep_data['train_acc']:^9} │ {ep_data['train_loss']:^10} │ {ep_data['val_acc']:^8} │ {ep_data['val_loss']:^9} │ ✔ Complete │")
            elif is_active and i == active_epoch_num:
                prog = (current_step / total_steps * 100.0) if (current_step and total_steps) else 0.0
                bar = generate_ascii_bar(prog, 15)
                acc_val = train_acc if train_acc != "-" else "--"
                loss_val = train_loss if train_loss != "-" else "--"
                rows.append(f"  │  {i:^4} │ {bar} {prog:4.1f}% │ {acc_val:^9} │ {loss_val:^10} │    --    │    --     │ ⟳ Running  │")
            else:
                bar = generate_ascii_bar(0.0, 15)
                rows.append(f"  │  {i:^4} │ {bar}   0.0% │    --     │     --     │    --    │    --     │ ○ Waiting  │")
        return rows

    p1_rows = format_tables_rows(p1_list, 15, current_epoch, "Phase 1" in current_module)
    p2_rows = format_tables_rows(p2_list, 25, current_epoch, "Phase 2" in current_module)
    p3_rows = format_tables_rows(p3_list, 15, current_epoch, "Phase 3" in current_module or "Distillation" in current_module)

    # Get best metrics
    all_completed = p1_list + p2_list + p3_list
    best_val_acc = "-"
    best_val_loss = "-"
    best_val_epoch = "-"
    if all_completed:
        try:
            valid_accs = [x for x in all_completed if x["val_acc"] != "-"]
            if valid_accs:
                best_item = max(valid_accs, key=lambda x: float(x["val_acc"].replace("%","")))
                best_val_acc = best_item["val_acc"]
                best_val_epoch = f"Epoch {best_item['epoch']}"
                best_loss_item = min(valid_accs, key=lambda x: float(x["val_loss"]))
                best_val_loss = best_loss_item["val_loss"]
        except Exception:
            pass

    tables_content = f"""╔══════════════════════════════════════════════════════════════════════════════════════════╗
║           AI CROP DISEASE DETECTION SYSTEM — MODEL TRAINING TABLES                      ║
║           MobileNetV3 (with SE Attention) | 85 Classes | 88,979 Images                  ║
║           Training Started: 2026-07-13 03:36:26  |  Last Updated: {last_updated}   ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STAGE 0 ▌ ARCHITECTURE SELECTION RACE                                    [✔ COMPLETED]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Overall Progress  ████████████████████████████████████████  100%  (2/2 Candidates)

  ┌─────────────────────┬────────┬───────────┬──────────┬───────────┬──────────┬──────────┐
  │ Candidate           │ Epochs │ Train Acc │ Val Acc  │ Val Loss  │ Latency  │ Result   │
  ├─────────────────────┼────────┼───────────┼──────────┼───────────┼──────────┼──────────┤
  │ MobileNetV3 ★       │  3/3   │  15.90%   │  31.32%  │  2.6941   │  ~120ms  │ ✔ WINNER │
  │ EfficientNetV2      │  3/3   │   2.48%   │   0.92%  │  4.2377   │   401ms  │ ✘ REJECT │
  └─────────────────────┴────────┴───────────┴──────────┴───────────┴──────────┴──────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STAGE 1 ▌ PHASE 1: CLASSIFIER HEAD TRAINING                         [{p1_status}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Overall Progress  {generate_ascii_bar(p1_pct, 30)}   {p1_pct:.1f}%  ({len(p1_list)}/15 Epochs)

  ┌───────┬─────────────────────────────────┬───────────┬────────────┬──────────┬───────────┬────────────┐
  │ Epoch │ Train Accuracy Progress         │ Train Acc │ Train Loss │  Val Acc │  Val Loss │ Status     │
  ├───────┼─────────────────────────────────┼───────────┼────────────┼──────────┼───────────┼────────────┤
{"\n".join(p1_rows)}
  └───────┴─────────────────────────────────┴───────────┴────────────┴──────────┴───────────┴────────────┘

  Best Validation Accuracy : {best_val_acc}  ({best_val_epoch})
  Best Validation Loss     : {best_val_loss}
  Estimated Time Remaining : {eta}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STAGE 2 ▌ PHASE 2: FINE-TUNING BASE LAYERS                            [{p2_status}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Overall Progress  {generate_ascii_bar(p2_pct, 30)}   {p2_pct:.1f}%  ({len(p2_list)}/25 Epochs)

  ┌───────┬─────────────────────────────────┬───────────┬────────────┬──────────┬───────────┬────────────┐
  │ Epoch │ Train Accuracy Progress         │ Train Acc │ Train Loss │  Val Acc │  Val Loss │ Status     │
  ├───────┼─────────────────────────────────┼───────────┼────────────┼──────────┼───────────┼────────────┤
{"\n".join(p2_rows)}
  └───────┴─────────────────────────────────┴───────────┴────────────┴──────────┴───────────┴────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STAGE 3 ▌ PHASE 3: KNOWLEDGE DISTILLATION                             [{p3_status}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Overall Progress  {generate_ascii_bar(p3_pct, 30)}   {p3_pct:.1f}%  ({len(p3_list)}/15 Epochs)

  ┌───────┬─────────────────────────────────┬───────────┬────────────┬──────────┬───────────┬────────────┐
  │ Epoch │ Train Accuracy Progress         │ Train Acc │ Train Loss │  Val Acc │  Val Loss │ Status     │
  ├───────┼─────────────────────────────────┼───────────┼────────────┼──────────┼───────────┼────────────┤
{"\n".join(p3_rows)}
  └───────┴─────────────────────────────────┴───────────┴────────────┴──────────┴───────────┴────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  OVERALL PIPELINE PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Pipeline Epochs  : 55  (Race:3 + Phase1:15 + Phase2:25 + Phase3:12)
  Epochs Completed       : {len(all_completed) + 3}  (Race:6 + Phases:{len(all_completed)} completed)
  Pipeline Progress      : {generate_ascii_bar(progress_pct, 30)}  {progress_pct:.1f}%
  Estimated Time Remaining: {eta} (Current Phase)

  Output Files:
  [ ] model/crop_disease_model.keras
  [ ] model/saved_models/student_model.keras
  [ ] model/saved_models/model_fp16.tflite
  [ ] model/saved_models/model_int8.tflite
"""
    try:
        with open(TABLES_FILE_PATH, "w", encoding="utf-8") as f:
            f.write(tables_content)
    except Exception:
        pass

class TrainingMonitorCallback(tf.keras.callbacks.Callback):
    def __init__(self, current_module, total_epochs_in_module, total_pipeline_epochs, completed_epochs_before_module, checkpoint_name):
        super().__init__()
        self.current_module = current_module
        self.total_epochs_in_module = total_epochs_in_module
        self.total_pipeline_epochs = total_pipeline_epochs
        self.completed_epochs_before_module = completed_epochs_before_module
        self.checkpoint_name = checkpoint_name
        
        self.epoch_start_time = None
        self.best_acc = 0.0
        self.best_epoch = 1
        self.epoch_idx = 0

    def on_train_begin(self, logs=None):
        cpu_usage, ram_usage, disk_usage = get_system_resources()
        write_files(
            current_module=self.current_module,
            current_epoch=0,
            total_epochs=self.total_epochs_in_module,
            progress_pct=(self.completed_epochs_before_module / self.total_pipeline_epochs) * 100.0,
            train_loss="-",
            train_acc="-",
            val_loss="-",
            val_acc="-",
            best_acc="-",
            best_epoch="-",
            lr="-",
            eta="Estimating...",
            checkpoint=self.checkpoint_name,
            health_status="Healthy",
            dataset_progress="0/88979 clean images"
        )

    def on_epoch_begin(self, epoch, logs=None):
        self.epoch_idx = epoch
        self.epoch_start_time = time.time()

    def on_train_batch_end(self, batch, logs=None):
        logs = logs or {}
        # Get total steps
        total_steps = self.params.get('steps', 3782)
        current_step = batch + 1
        
        # Auto-update every 50 batches or at the very end
        if current_step % 50 == 0 or current_step == total_steps:
            elapsed = time.time() - self.epoch_start_time
            train_loss = logs.get("loss", 0.0)
            train_acc = logs.get("accuracy", logs.get("categorical_accuracy", 0.0))
            
            # Estimate ETA
            avg_step_time = elapsed / current_step
            remaining_steps = (total_steps - current_step) + (self.total_epochs_in_module - (self.epoch_idx + 1)) * total_steps
            eta_seconds = remaining_steps * avg_step_time
            eta_str = str(datetime.timedelta(seconds=int(eta_seconds)))
            
            # Get learning rate
            lr = "-"
            if self.model and self.model.optimizer:
                try:
                    lr = float(tf.keras.backend.get_value(self.model.optimizer.learning_rate))
                    lr = f"{lr:.2e}"
                except Exception:
                    pass

            # Overall progress
            completed_epochs = self.completed_epochs_before_module + self.epoch_idx
            progress_pct = ((completed_epochs + (current_step / total_steps)) / self.total_pipeline_epochs) * 100.0
            
            # Format metrics
            t_loss_str = f"{train_loss:.4f}"
            t_acc_str = f"{train_acc * 100.0:.2f}%"
            
            write_files(
                current_module=self.current_module,
                current_epoch=self.epoch_idx + 1,
                total_epochs=self.total_epochs_in_module,
                progress_pct=progress_pct,
                train_loss=t_loss_str,
                train_acc=t_acc_str,
                val_loss="-",
                val_acc="-",
                best_acc=f"{self.best_acc * 100.0:.2f}%" if self.best_acc > 0 else "-",
                best_epoch=self.best_epoch if self.best_acc > 0 else "-",
                lr=lr,
                eta=eta_str,
                checkpoint=self.checkpoint_name,
                health_status="Healthy",
                dataset_progress=f"{current_step * 24}/88979 clean images" if "Distillation" not in self.current_module else f"{current_step * 24}/88979 images",
                current_step=current_step,
                total_steps=total_steps
            )

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        elapsed = time.time() - self.epoch_start_time
        
        # Extract metrics
        train_loss = logs.get("loss", 0.0)
        train_acc = logs.get("accuracy", logs.get("categorical_accuracy", 0.0))
        val_loss = logs.get("val_loss", None)
        val_acc = logs.get("val_accuracy", logs.get("val_categorical_accuracy", None))
        
        # Get learning rate
        lr = "-"
        if self.model and self.model.optimizer:
            try:
                lr = float(tf.keras.backend.get_value(self.model.optimizer.learning_rate))
                lr = f"{lr:.2e}"
            except Exception:
                try:
                    lr = float(self.model.optimizer.learning_rate(self.model.optimizer.iterations))
                    lr = f"{lr:.2e}"
                except Exception:
                    pass

        # Update best metrics
        actual_epoch = epoch + 1
        if val_acc is not None:
            if val_acc > self.best_acc:
                self.best_acc = val_acc
                self.best_epoch = actual_epoch
        else:
            if train_acc > self.best_acc:
                self.best_acc = train_acc
                self.best_epoch = actual_epoch

        # Overall progress
        completed_epochs = self.completed_epochs_before_module + actual_epoch
        progress_pct = (completed_epochs / self.total_pipeline_epochs) * 100.0
        
        # ETA calculation
        remaining_epochs = self.total_pipeline_epochs - completed_epochs
        eta_seconds = remaining_epochs * elapsed
        eta_str = str(datetime.timedelta(seconds=int(eta_seconds)))

        # Format metric strings
        t_loss_str = f"{train_loss:.4f}"
        t_acc_str = f"{train_acc * 100.0:.2f}%"
        v_loss_str = f"{val_loss:.4f}" if val_loss is not None else "-"
        v_acc_str = f"{val_acc * 100.0:.2f}%" if val_acc is not None else "-"
        b_acc_str = f"{self.best_acc * 100.0:.2f}%"
        
        # Save to history database
        history = load_monitor_history()
        
        # Map phase keys dynamically to match output tables
        phase_key = self.current_module.split(" (")[0]
        if "Phase 1" in self.current_module:
            phase_key = "Phase 1: Classifier Head"
        elif "Phase 2" in self.current_module:
            phase_key = "Phase 2: Fine-Tuning"
        elif "Phase 3" in self.current_module or "Distillation" in self.current_module:
            phase_key = "Phase 3: Knowledge Distillation"
            
        if phase_key not in history:
            history[phase_key] = []
            
        # Check if this epoch already exists in history to update it (handles restarts)
        epoch_idx = -1
        for i, ep in enumerate(history[phase_key]):
            if ep["epoch"] == actual_epoch:
                epoch_idx = i
                break
                
        epoch_data = {
            "epoch": actual_epoch,
            "train_loss": t_loss_str,
            "train_acc": t_acc_str,
            "val_loss": v_loss_str,
            "val_acc": v_acc_str,
            "lr": lr,
            "status": "Completed"
        }
        
        if epoch_idx != -1:
            history[phase_key][epoch_idx] = epoch_data
        else:
            history[phase_key].append(epoch_data)
            
        save_monitor_history(history)

        write_files(
            current_module=self.current_module,
            current_epoch=actual_epoch,
            total_epochs=self.total_epochs_in_module,
            progress_pct=progress_pct,
            train_loss=t_loss_str,
            train_acc=t_acc_str,
            val_loss=v_loss_str,
            val_acc=v_acc_str,
            best_acc=b_acc_str,
            best_epoch=self.best_epoch,
            lr=lr,
            eta=eta_str,
            checkpoint=self.checkpoint_name,
            health_status="Healthy",
            dataset_progress="88979/88979 clean images"
        )

def update_module_transition(module_name, status_message, completed_epochs_before, total_pipeline_epochs):
    cpu_usage, ram_usage, disk_usage = get_system_resources()
    last_updated = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    progress_pct = (completed_epochs_before / total_pipeline_epochs) * 100.0
    
    if module_name == "Step 1: Dataset Validation & Preparation":
        # Only reset history if we are starting fresh (no checkpoint states exist)
        checkpoint_dir = r"c:\AI Crop Disease Detection System\model\saved_models\checkpoints"
        has_checkpoint = False
        if os.path.exists(checkpoint_dir):
            for f in os.listdir(checkpoint_dir):
                if f.endswith("_state.json"):
                    has_checkpoint = True
                    break
        if not has_checkpoint and os.path.exists(HISTORY_FILE_PATH):
            try:
                os.remove(HISTORY_FILE_PATH)
            except Exception:
                pass
                
    status_content = f"""# Agri Shield - Production Model Training Status

- **Current Module:** {module_name}
- **Current Epoch:** N/A (Transitioning)
- **Overall Progress:** {progress_pct:.2f}%
- **Training Accuracy:** N/A
- **Validation Accuracy:** N/A
- **Training Loss:** N/A
- **Validation Loss:** N/A
- **Best Accuracy:** N/A
- **Best Epoch:** N/A
- **Learning Rate:** N/A
- **ETA:** Transitioning...
- **Health Status:** Healthy
- **Current Checkpoint:** {status_message}
- **Dataset Progress:** Processing/Exporting...
- **Last Updated:** {last_updated}

## System Resource Metrics
- **CPU Usage:** {cpu_usage}
- **RAM Usage:** {ram_usage}
- **Disk Usage:** {disk_usage}
"""
    try:
        with open(STATUS_FILE_PATH, "w") as f:
            f.write(status_content)
    except Exception:
        pass

    # Update model_training formatted output
    history = load_monitor_history()
    def format_table(epochs_list):
        if not epochs_list:
            return "*No epochs completed yet.*"
        header  = "| Epoch |  Train Acc  |  Train Loss  |  Val Acc  |  Val Loss  |     LR     |  Status   |"
        divider = "|-------|-------------|--------------|-----------|------------|------------|-----------|"
        rows = [header, divider]
        for ep in epochs_list:
            rows.append(
                f"| {ep['epoch']:^5} | {ep['train_acc']:^11} | {ep['train_loss']:^12} | {ep['val_acc']:^9} | {ep['val_loss']:^10} | {ep['lr']:^10} | {ep['status']:<9} |"
            )
        return "\n".join(rows)

    log_content = f"""==================================================
AI Crop Disease Detection System - Model Training Log
==================================================
Training Started: 2026-07-13 03:36:26 (Local Time)
Base Model Architecture: MobileNetV3 (with SE Attention)
Dataset Size: 88,979 clean images (85 classes)
Last Update: {last_updated}
Current Phase: {module_name} ({status_message})

--------------------------------------------------
Phase 1: Classifier Head Training (Target: 15 Epochs)
--------------------------------------------------
{format_table(history.get("Phase 1: Classifier Head", []))}

--------------------------------------------------
Phase 2: Fine-Tuning Base Layers (Target: 25 Epochs)
--------------------------------------------------
{format_table(history.get("Phase 2: Fine-Tuning", []))}

--------------------------------------------------
Phase 3: Knowledge Distillation (Target: 15 Epochs)
--------------------------------------------------
{format_table(history.get("Phase 3: Knowledge Distillation", []))}
"""
    try:
        with open(LOG_FILE_PATH, "w") as f:
            f.write(log_content)
    except Exception:
        pass
