from datetime import timezone
import os
import torch
import timm
from backend.services.pytorch.utils import get_device

def load_pytorch_model(weights_path: str = None, num_classes: int = 1226, architecture: str = "tf_efficientnetv2_s"):
    """
    Instantiates PyTorch timm model architecture and loads weights from best_model.pth.
    """
    if weights_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        weights_path = os.path.join(base_dir, "model", "trained pytorch", "best_model.pth")

    if not os.path.exists(weights_path):
        raise FileNotFoundError(f"PyTorch model weights not found at: {weights_path}")

    device = get_device()

    # Recreate identical timm architecture
    model = timm.create_model(architecture, pretrained=False, num_classes=num_classes)

    # Load weights
    checkpoint = torch.load(weights_path, map_location=device)
    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        model.load_state_dict(checkpoint["state_dict"])
    elif isinstance(checkpoint, dict) and "model" in checkpoint:
        model.load_state_dict(checkpoint["model"])
    else:
        model.load_state_dict(checkpoint)

    model.to(device)
    model.eval()

    return model, device
