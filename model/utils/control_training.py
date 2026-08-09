"""
Training Control Script
========================
Commands:
  pause    - Instantly freeze the training process (memory preserved, no data loss)
  resume   - Un-freeze a paused training process (continues exactly where it stopped)
  continue - Restart training from the last saved checkpoint (use after crashes/power cuts)
  status   - Show current training process status

Usage:
  python -m model.utils.control_training pause
  python -m model.utils.control_training resume
  python -m model.utils.control_training continue
  python -m model.utils.control_training status
"""

import sys
import os
import json
import time
import subprocess
import psutil
import datetime

# Paths
PROJECT_ROOT = r"C:\AI Crop Disease Detection System"
CHECKPOINT_DIR = os.path.join(PROJECT_ROOT, "model", "saved_models", "checkpoints")
STATE_FILE = os.path.join(CHECKPOINT_DIR, "MobileNetV3_fold_0_state.json")
PID_FILE = os.path.join(CHECKPOINT_DIR, "training_pid.json")
LOG_FILE = os.path.join(PROJECT_ROOT, "model_training")


def save_pid(pid):
    """Save the training process PID to disk."""
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    with open(PID_FILE, "w") as f:
        json.dump({"pid": pid, "started_at": datetime.datetime.now().isoformat()}, f, indent=2)


def load_pid():
    """Load the saved training PID from disk."""
    if os.path.exists(PID_FILE):
        try:
            with open(PID_FILE, "r") as f:
                data = json.load(f)
                return data.get("pid")
        except Exception:
            pass
    return None


def get_training_processes():
    """Find all live training processes by scanning process list."""
    procs = []
    for p in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmd = p.info['cmdline']
            if cmd and any('model.train' in arg for arg in cmd):
                if not any('control_training' in arg for arg in cmd):
                    procs.append(p)
        except Exception:
            pass
    return procs


def get_process_by_pid(pid):
    """Get a psutil process object by PID, returns None if not alive."""
    try:
        p = psutil.Process(pid)
        if p.is_running():
            return p
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        pass
    return None


def append_log(message):
    """Append a timestamped control event to the model_training log file."""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"\n[{timestamp}] CONTROL EVENT: {message}\n")
    except Exception:
        pass


def load_checkpoint_state():
    """Load the current phase/epoch from the checkpoint state file."""
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return None


def do_pause():
    """Instantly freeze the training process."""
    procs = get_training_processes()

    # Also try saved PID as fallback
    saved_pid = load_pid()
    if saved_pid and not any(p.pid == saved_pid for p in procs):
        p = get_process_by_pid(saved_pid)
        if p:
            procs.append(p)

    if not procs:
        print("❌ No active training process found to pause.")
        print("   (Training may not be running — use 'continue' to start it)")
        return

    paused_any = False
    for p in procs:
        try:
            if p.status() == psutil.STATUS_STOPPED:
                print(f"⚠️  PID {p.pid} is already paused.")
                continue
            p.suspend()
            save_pid(p.pid)
            state = load_checkpoint_state()
            state_str = f"Phase {state['phase']} Epoch {state['epoch']}" if state else "unknown"
            print(f"✅ PAUSED — PID {p.pid} frozen at {state_str}")
            print(f"   Process is preserved in memory. Run 'resume' to continue instantly.")
            append_log(f"PAUSED — PID {p.pid} frozen at {state_str}")
            paused_any = True
        except Exception as e:
            print(f"❌ Error pausing PID {p.pid}: {e}")

    if not paused_any:
        print("   No processes were paused (they may already be paused).")


def do_resume():
    """Un-freeze a paused training process — continues exactly where it stopped."""
    procs = get_training_processes()

    # Also try saved PID
    saved_pid = load_pid()
    if saved_pid and not any(p.pid == saved_pid for p in procs):
        p = get_process_by_pid(saved_pid)
        if p:
            procs.append(p)

    if not procs:
        print("❌ No paused training process found in memory.")
        print("   The process may have exited after a crash or power cut.")
        print("   → Use 'continue' instead to restart from the last checkpoint.")
        return

    resumed_any = False
    for p in procs:
        try:
            if p.status() != psutil.STATUS_STOPPED:
                print(f"⚠️  PID {p.pid} is not paused (status: {p.status()}). Nothing to resume.")
                continue
            p.resume()
            state = load_checkpoint_state()
            state_str = f"Phase {state['phase']} Epoch {state['epoch']}" if state else "unknown"
            print(f"✅ RESUMED — PID {p.pid} continuing from {state_str}")
            append_log(f"RESUMED — PID {p.pid} continuing from {state_str}")
            resumed_any = True
        except Exception as e:
            print(f"❌ Error resuming PID {p.pid}: {e}")

    if not resumed_any:
        print("   No processes were resumed.")
        print("   → Use 'continue' to restart from the last saved checkpoint.")


def do_continue():
    """Restart training from the last saved checkpoint after any interruption."""
    # Check if training is already running
    procs = get_training_processes()
    if procs:
        for p in procs:
            if p.status() == psutil.STATUS_STOPPED:
                print(f"⚠️  Training is paused (PID {p.pid}). Use 'resume' to un-pause it.")
                return
            else:
                print(f"⚠️  Training is already running (PID {p.pid}, status: {p.status()}).")
                print("   Use 'pause' to pause it, or 'status' to check progress.")
                return

    # Load last checkpoint state
    state = load_checkpoint_state()
    if state:
        print(f"📂 Found checkpoint: Phase {state['phase']}, Epoch {state['epoch']}")
        print(f"   Resuming training from Phase {state['phase']} Epoch {state['epoch']}...")
    else:
        print("📂 No checkpoint found — starting fresh training...")

    append_log("CONTINUE — Restarting training from last checkpoint")

    # Launch training as background process
    log_path = os.path.join(PROJECT_ROOT, "logs", "training_continue.log")
    os.makedirs(os.path.dirname(log_path), exist_ok=True)

    log_f = open(log_path, "a", encoding="utf-8")
    proc = subprocess.Popen(
        [sys.executable, "-m", "model.train"],
        cwd=PROJECT_ROOT,
        stdout=log_f,
        stderr=log_f,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
    )
    log_f.close()

    save_pid(proc.pid)
    print(f"✅ CONTINUE — Training restarted (PID {proc.pid})")
    print(f"   Log: {log_path}")
    print(f"   Monitor: check model_training file for live updates")
    append_log(f"CONTINUE — Training restarted with PID {proc.pid}")


def do_status():
    """Show current training process status."""
    procs = get_training_processes()
    saved_pid = load_pid()

    print("=" * 50)
    print("  TRAINING STATUS")
    print("=" * 50)

    if not procs and saved_pid:
        p = get_process_by_pid(saved_pid)
        if p:
            procs.append(p)

    if not procs:
        print("  Status : NOT RUNNING")
        if saved_pid:
            print(f"  Last PID: {saved_pid} (process has exited)")
        print("  → Use 'continue' to restart from the last checkpoint")
    else:
        for p in procs:
            try:
                status = p.status()
                cpu = p.cpu_percent(interval=0.5)
                mem = p.memory_info().rss / (1024 ** 2)
                status_label = "⏸️  PAUSED" if status == psutil.STATUS_STOPPED else "▶️  RUNNING"
                print(f"  Status : {status_label}")
                print(f"  PID    : {p.pid}")
                print(f"  CPU    : {cpu:.1f}%")
                print(f"  RAM    : {mem:.0f} MB")
            except Exception as e:
                print(f"  PID {p.pid}: Error ({e})")

    state = load_checkpoint_state()
    if state:
        print(f"  Checkpoint: Phase {state['phase']}, Epoch {state['epoch']}")
    else:
        print("  Checkpoint: None found")

    print("=" * 50)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    action = sys.argv[1].lower().strip()

    if action == "pause":
        do_pause()
    elif action == "resume":
        do_resume()
    elif action == "continue":
        do_continue()
    elif action == "status":
        do_status()
    else:
        print(f"❌ Unknown command: '{action}'")
        print("   Valid commands: pause | resume | continue | status")
        sys.exit(1)


if __name__ == "__main__":
    main()
