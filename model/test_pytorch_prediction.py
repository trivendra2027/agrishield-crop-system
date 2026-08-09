import os
import sys
import numpy as np

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from model.pytorch_model_loader import PyTorchModelLoader

def test_pytorch_inference():
    print("=" * 60)
    print("Testing PyTorch Model Inference Pipeline")
    print("=" * 60)
    
    loader = PyTorchModelLoader()
    print(f"Device               : {loader.device}")
    print(f"Model Architecture   : {loader.architecture}")
    print(f"Number of Classes    : {loader.num_classes}")
    print(f"Model Path           : {loader.model_path}")
    print(f"Classes Path         : {loader.classes_path}")
    print("Model loaded successfully!")
    print("-" * 60)
    
    # Locate sample test image
    sample_image = os.path.join(BASE_DIR, "test_leaf.jpg")
    if not os.path.exists(sample_image):
        print(f"[INFO] Sample image {sample_image} not found, creating synthetic RGB test image...")
        from PIL import Image
        synthetic = Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8))
        sample_image = os.path.join(BASE_DIR, "synthetic_test_leaf.jpg")
        synthetic.save(sample_image)
        
    print(f"Running inference on: {sample_image}")
    result = loader.predict_image(sample_image, top_k=5)
    
    print("-" * 60)
    print(f"Top Prediction      : {result['top_class']}")
    print(f"Confidence          : {result['confidence']:.4f} ({result['confidence']*100:.2f}%)")
    print(f"Inference Time      : {result['inference_time_ms']:.2f} ms")
    print("-" * 60)
    print("Top 5 Predictions:")
    for idx, pred in enumerate(result['top_predictions'], 1):
        print(f"  {idx}. {pred['class_name']:<40} Confidence: {pred['confidence']:.4f}")
        
    prob_sum = float(np.sum(result['all_probabilities']))
    print("-" * 60)
    print(f"Sum of Probabilities: {prob_sum:.4f} (Asserting ~ 1.0)")
    assert abs(prob_sum - 1.0) < 1e-3, "Probabilities do not sum to 1.0!"
    print("ALL PYTORCH MODEL INFERENCE TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_pytorch_inference()
