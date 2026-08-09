import os
import json
import time
import numpy as np
import tensorflow as tf
from model.configs.config import PipelineConfig
from model.utils.logger import get_logger

logger = get_logger("System_Auditor")

def run_production_audit():
    """Performs an automated production audit over datasets, training setups, model exports, and FastAPI compatibility."""
    logger.info("Starting production readiness engine audit...")
    
    findings = []
    status = "PASSED"
    
    # 1. Dataset Quality Audit
    quality_report = os.path.join(PipelineConfig.REPORTS_DIR, "dataset_quality_report.json")
    if os.path.exists(quality_report):
        with open(quality_report, "r") as f:
            data = json.load(f)
            std_dev = data.get("class_standard_deviation", 0.0)
            if std_dev > 50.0:
                findings.append(f"[WARNING] High dataset imbalance detected (class standard deviation: {std_dev:.1f}). Ensure class weights are enabled.")
    else:
        findings.append("[ERROR] Dataset Quality Report not found. Ensure preprocessing has run successfully.")
        status = "FAILED"
        
    # 2. Cross Validation & Evaluation Audit
    cv_report = os.path.join(PipelineConfig.REPORTS_DIR, "cross_validation_report.json")
    if not os.path.exists(cv_report):
        findings.append("[WARNING] 5-Fold Cross Validation report missing. Run full training to audit.")
        
    # 3. Explainability Audits
    for plot in ["reliability_diagram.png", "roc_curves.png"]:
        if not os.path.exists(os.path.join(PipelineConfig.REPORTS_DIR, plot)):
            findings.append(f"[WARNING] Visualization plot {plot} missing in reports folder.")
            
    # 4. Exports & Quantization Audit
    missing_exports = []
    for fmt in ["best_model.keras", "model_fp16.tflite", "model_int8.tflite", "model.onnx"]:
        if not os.path.exists(os.path.join(PipelineConfig.SAVED_MODELS_DIR, fmt)):
            missing_exports.append(fmt)
    if missing_exports:
        findings.append(f"[WARNING] Some deployment model formats are missing: {', '.join(missing_exports)}.")
        
    # 5. FastAPI router verification
    fastapi_router_path = os.path.join(PipelineConfig.WORKSPACE_ROOT, "backend", "app", "routers", "predict.py")
    if os.path.exists(fastapi_router_path):
        with open(fastapi_router_path, "r", encoding="utf-8") as f:
            content = f.read()
            if "HTTP_422_UNPROCESSABLE_ENTITY" not in content and "422" not in content:
                findings.append("[ERROR] FastAPI router is missing the 422 low-confidence scan rejection exception guard.")
                status = "FAILED"
    else:
        findings.append("[WARNING] FastAPI backend router predict.py not found at local workspace path.")

    # 6. Benchmark Latency speed check
    latency_ok = True
    if os.path.exists(PipelineConfig.BEST_MODEL_PATH):
        try:
            model = tf.keras.models.load_model(PipelineConfig.BEST_MODEL_PATH)
            dummy_input = np.random.rand(1, 224, 224, 3).astype(np.float32)
            
            # Run 20 passes to calculate average latency
            start = time.time()
            for _ in range(20):
                _ = model(dummy_input, training=False)
            avg_latency = (time.time() - start) / 20.0 * 1000.0
            
            if avg_latency > 350.0:
                findings.append(f"[WARNING] High inference latency on CPU: {avg_latency:.1f}ms. Recommend TFLite FP16/INT8 deployment formats.")
                latency_ok = False
        except Exception as e:
            findings.append(f"[ERROR] Failed to run benchmark inference on saved model: {e}")
            status = "FAILED"
            
    # Assemble Production Audit Report
    audit_report = {
        "status": status,
        "audit_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "tensorflow_version": tf.__version__,
        "mixed_precision_enabled": tf.keras.mixed_precision.global_policy().name,
        "findings": findings
    }
    
    report_path = os.path.join(PipelineConfig.REPORTS_DIR, "production_readiness_report.json")
    with open(report_path, "w") as f:
        json.dump(audit_report, f, indent=2)
        
    logger.info(f"Saved Production Audit Report to: {report_path}")
    logger.info(f"Audit Status: {status}. Total issues flagged: {len(findings)}")
    return audit_report
