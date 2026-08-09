from datetime import timezone
import torch
from torchvision import transforms
from PIL import Image
import cv2
import numpy as np
from typing import Union

def get_test_transforms(image_size: int = 224):
    """
    Returns torchvision transforms for PyTorch EfficientNetV2 inference.
    Preserves aspect ratio using Resize(256) followed by CenterCrop(224).
    Normalization: ImageNet mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225].
    """
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(image_size),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

def preprocess_image(image_input: Union[str, Image.Image, np.ndarray], image_size: int = 224) -> torch.Tensor:
    """
    Preprocesses input image (filepath, PIL Image, or OpenCV BGR numpy array) into a 4D PyTorch Tensor (1, 3, 224, 224).
    """
    transform = get_test_transforms(image_size)

    if isinstance(image_input, str):
        image = Image.open(image_input).convert('RGB')
    elif isinstance(image_input, np.ndarray):
        # Convert OpenCV BGR to PIL RGB
        if image_input.ndim == 3 and image_input.shape[2] == 3:
            rgb = cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB)
            image = Image.fromarray(rgb)
        else:
            image = Image.fromarray(image_input).convert('RGB')
    elif isinstance(image_input, Image.Image):
        image = image_input.convert('RGB')
    else:
        raise ValueError(f"Unsupported image input type: {type(image_input)}")

    tensor = transform(image)
    return tensor.unsqueeze(0)  # Shape: (1, 3, 224, 224)
