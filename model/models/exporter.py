import os
import time
import json
import numpy as np
import tensorflow as tf
from model.configs.config import PipelineConfig
from model.utils.logger import get_logger

logger = get_logger("Model_Exporter")

def export_all_formats(model, val_paths, preprocess_fn):
    """Exports the trained model into SavedModel, Keras, TFLite FP16, TFLite INT8, and ONNX formats."""
    logger.info("Initializing multi-format export pipeline...")
    os.makedirs(PipelineConfig.SAVED_MODELS_DIR, exist_ok=True)
    
    # 1. Save standard Keras model
    keras_path = os.path.join(PipelineConfig.SAVED_MODELS_DIR, "best_model.keras")
    model.save(keras_path)
    logger.info(f"Saved Keras model to: {keras_path}")
    
    # 2. Save SavedModel
    saved_model_path = os.path.join(PipelineConfig.SAVED_MODELS_DIR, "saved_model")
    try:
        model.export(saved_model_path)
        logger.info(f"Saved SavedModel package to: {saved_model_path}")
    except Exception as e:
        try:
            tf.saved_model.save(model, saved_model_path)
            logger.info(f"Saved SavedModel package to: {saved_model_path}")
        except Exception as ex:
            logger.warning(f"Could not save SavedModel format: {ex}")
    
    # 3. Save TFLite FP16
    tflite_fp16_path = os.path.join(PipelineConfig.SAVED_MODELS_DIR, "model_fp16.tflite")
    try:
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.float16]
        tflite_fp16_model = converter.convert()
        with open(tflite_fp16_path, "wb") as f:
            f.write(tflite_fp16_model)
        logger.info(f"Saved TFLite FP16 model to: {tflite_fp16_path}")
    except Exception as e:
        logger.error(f"Failed to export TFLite FP16: {e}")
        
    # 4. Save TFLite INT8 (Post-Training Integer Quantization)
    tflite_int8_path = os.path.join(PipelineConfig.SAVED_MODELS_DIR, "model_int8.tflite")
    try:
        def representative_dataset_gen():
            # Yield representative subset from validation set
            for path in val_paths[:30]:
                img = preprocess_fn(path)
                yield [img]
                
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.representative_dataset = representative_dataset_gen
        # Enforce full integer quantization
        converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
        converter.inference_input_type = tf.float32
        converter.inference_output_type = tf.float32
        tflite_int8_model = converter.convert()
        with open(tflite_int8_path, "wb") as f:
            f.write(tflite_int8_model)
        logger.info(f"Saved TFLite INT8 model to: {tflite_int8_path}")
    except Exception as e:
        logger.error(f"Failed to export TFLite INT8: {e}")
        
    # 5. Save ONNX Format
    onnx_path = os.path.join(PipelineConfig.SAVED_MODELS_DIR, "model.onnx")
    try:
        import tf2onnx
        import subprocess
        logger.info("Converting model to ONNX format...")
        # Compile using command line tf2onnx module
        cmd = f"python -m tf2onnx.convert --saved-model \"{saved_model_path}\" --output \"{onnx_path}\" --opset 13"
        subprocess.run(cmd, shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        logger.info(f"Saved ONNX model to: {onnx_path}")
    except Exception as e:
        logger.warning(f"Could not export to ONNX format (tf2onnx might not be installed): {e}")

    # Benchmark formats and recommend best deployment target
    benchmark_report = run_export_benchmarks(keras_path, tflite_fp16_path, tflite_int8_path, onnx_path)
    return benchmark_report

def get_file_size_mb(file_path):
    """Retrieve file size in MegaBytes."""
    if os.path.exists(file_path):
        return os.path.getsize(file_path) / (1024 * 1024)
    return 0.0

def run_export_benchmarks(keras_path, tflite_fp16_path, tflite_int8_path, onnx_path):
    """Measures latency, FPS, and file size across all exported model formats."""
    logger.info("Executing format benchmarks...")
    
    # Placeholder input
    dummy_input = np.random.rand(1, 224, 224, 3).astype(np.float32)
    
    benchmark_data = {}
    
    # 1. Keras Benchmark
    if os.path.exists(keras_path):
        try:
            model = tf.keras.models.load_model(keras_path)
            # Warm up
            _ = model.predict(dummy_input, verbose=0)
            
            start = time.time()
            for _ in range(50):
                _ = model.predict(dummy_input, verbose=0)
            elapsed = time.time() - start
            avg_ms = (elapsed / 50.0) * 1000
            
            benchmark_data["Keras"] = {
                "size_mb": get_file_size_mb(keras_path),
                "latency_ms": avg_ms,
                "fps": 1000.0 / avg_ms
            }
        except Exception as e:
            logger.error(f"Error benchmarking Keras: {e}")

    # 2. TFLite FP16 Benchmark
    if os.path.exists(tflite_fp16_path):
        try:
            interpreter = tf.lite.Interpreter(model_path=tflite_fp16_path)
            interpreter.allocate_tensors()
            input_idx = interpreter.get_input_details()[0]['index']
            output_idx = interpreter.get_output_details()[0]['index']
            
            interpreter.set_tensor(input_idx, dummy_input)
            interpreter.invoke() # Warm up
            
            start = time.time()
            for _ in range(50):
                interpreter.set_tensor(input_idx, dummy_input)
                interpreter.invoke()
            elapsed = time.time() - start
            avg_ms = (elapsed / 50.0) * 1000
            
            benchmark_data["TFLite_FP16"] = {
                "size_mb": get_file_size_mb(tflite_fp16_path),
                "latency_ms": avg_ms,
                "fps": 1000.0 / avg_ms
            }
        except Exception as e:
            logger.error(f"Error benchmarking TFLite FP16: {e}")

    # 3. TFLite INT8 Benchmark
    if os.path.exists(tflite_int8_path):
        try:
            interpreter = tf.lite.Interpreter(model_path=tflite_int8_path)
            interpreter.allocate_tensors()
            input_idx = interpreter.get_input_details()[0]['index']
            
            interpreter.set_tensor(input_idx, dummy_input)
            interpreter.invoke() # Warm up
            
            start = time.time()
            for _ in range(50):
                interpreter.set_tensor(input_idx, dummy_input)
                interpreter.invoke()
            elapsed = time.time() - start
            avg_ms = (elapsed / 50.0) * 1000
            
            benchmark_data["TFLite_INT8"] = {
                "size_mb": get_file_size_mb(tflite_int8_path),
                "latency_ms": avg_ms,
                "fps": 1000.0 / avg_ms
            }
        except Exception as e:
            logger.error(f"Error benchmarking TFLite INT8: {e}")

    # 4. ONNX Benchmark
    if os.path.exists(onnx_path):
        try:
            import onnxruntime as ort
            sess = ort.InferenceSession(onnx_path)
            input_name = sess.get_inputs()[0].name
            
            _ = sess.run(None, {input_name: dummy_input}) # Warm up
            
            start = time.time()
            for _ in range(50):
                _ = sess.run(None, {input_name: dummy_input})
            elapsed = time.time() - start
            avg_ms = (elapsed / 50.0) * 1000
            
            benchmark_data["ONNX"] = {
                "size_mb": get_file_size_mb(onnx_path),
                "latency_ms": avg_ms,
                "fps": 1000.0 / avg_ms
            }
        except Exception as e:
            logger.warning(f"Could not benchmark ONNX format (onnxruntime might not be installed): {e}")

    # Make automatic deployment recommendation
    recommendation = "Keras"
    best_fps = 0.0
    for fmt, metrics in benchmark_data.items():
        if metrics["fps"] > best_fps:
            best_fps = metrics["fps"]
            recommendation = fmt
            
    report = {
        "formats_benchmarks": benchmark_data,
        "recommended_deployment_format": recommendation
    }
    
    os.makedirs(PipelineConfig.REPORTS_DIR, exist_ok=True)
    report_path = os.path.join(PipelineConfig.REPORTS_DIR, "deployment_optimization_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
        
    logger.info(f"Deployment benchmark report saved to: {report_path}")
    logger.info(f"Recommended format based on FPS latency: {recommendation}")
    return report
