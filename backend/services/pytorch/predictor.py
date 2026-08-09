from datetime import timezone
import time
import torch
import torch.nn.functional as F
from typing import Dict, Any, Union
from PIL import Image
import numpy as np

from backend.services.pytorch.model_loader import load_pytorch_model
from backend.services.pytorch.preprocessing import preprocess_image
from backend.services.pytorch.class_mapper import ClassMapper

class PyTorchPredictor:
    _instance = None

    def __init__(self):
        self.class_mapper = ClassMapper()
        self.model, self.device = load_pytorch_model(num_classes=self.class_mapper.num_classes)

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def predict(self, image_input: Union[str, Image.Image, np.ndarray]) -> Dict[str, Any]:
        """
        Executes end-to-end PyTorch inference on the given image input.
        """
        start_time = time.time()

        # Preprocess input image to (1, 3, 224, 224)
        tensor = preprocess_image(image_input).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor)
            probabilities = F.softmax(logits, dim=1)[0]

        # Calculate top-5 predictions
        top5_probs, top5_indices = torch.topk(probabilities, k=5)
        top5_probs = top5_probs.cpu().numpy()
        top5_indices = top5_indices.cpu().numpy()

        top5_list = []
        for prob, idx in zip(top5_probs, top5_indices):
            raw_class = self.class_mapper.get_class_name(idx)
            crop, disease, status = self.class_mapper.parse_class_details(raw_class)
            top5_list.append({
                "class_index": int(idx),
                "raw_label": raw_class,
                "crop_name": crop,
                "disease_name": disease,
                "confidence": round(float(prob) * 100.0, 2)
            })

        top1 = top5_list[0] if top5_list else {}

        # Calculate crop-level aggregated probabilities across all 1226 classes
        all_probs = probabilities.cpu().numpy()
        crop_totals = {}
        for idx, prob in enumerate(all_probs):
            if prob > 0.0005:
                raw_class = self.class_mapper.get_class_name(idx)
                crop, _, _ = self.class_mapper.parse_class_details(raw_class)
                # Ignore insect pest categories when extracting primary crop species
                if crop.lower() not in ["therioaphis", "aphid", "aphids", "thrips", "whitefly", "bruchus", "pest", "bug"]:
                    crop_totals[crop] = crop_totals.get(crop, 0.0) + float(prob)

        sorted_crops = sorted(crop_totals.items(), key=lambda x: x[1], reverse=True)
        primary_crop = sorted_crops[0][0] if sorted_crops else top1["crop_name"]
        primary_crop_confidence = round(sorted_crops[0][1] * 100.0, 2) if sorted_crops else top1["confidence"]

        # If aggregated crop probability is higher, use it for crop species identification
        final_crop_name = primary_crop if primary_crop_confidence >= top1["confidence"] else top1["crop_name"]
        final_confidence = max(primary_crop_confidence, top1["confidence"])

        elapsed_ms = (time.time() - start_time) * 1000.0

        return {
            "success": True,
            "prediction": top1["disease_name"],
            "raw_label": top1["raw_label"],
            "crop_name": final_crop_name,
            "disease_name": top1["disease_name"],
            "confidence": final_confidence,
            "top5": top5_list,
            "aggregated_crops": sorted_crops[:5],
            "processing_time": f"{elapsed_ms:.2f}ms",
            "processing_time_ms": elapsed_ms,
            "model": "PyTorch (tf_efficientnetv2_s)"
        }

def get_pytorch_predictor() -> PyTorchPredictor:
    return PyTorchPredictor.get_instance()
