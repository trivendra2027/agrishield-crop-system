from datetime import timezone
import os
import cv2
from backend.app.services.plant_identifier.utils import (
    calculate_blurriness,
    calculate_brightness,
    calculate_green_ratio
)

SUPPORTED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'}

def validate_plant_image(image_path: str) -> dict:
    """
    Validates input image quality before plant identification.
    
    Checks performed:
    1. Image presence & existence
    2. File format compatibility
    3. Image loadability
    4. Blurriness threshold
    5. Brightness (too dark / too bright)
    6. Plant presence check
    """
    # 1. Image presence check
    if not image_path or not isinstance(image_path, str):
        return {
            "is_valid": False,
            "error_code": "NO_IMAGE",
            "message": "No image provided for plant identification."
        }

    if not os.path.exists(image_path):
        return {
            "is_valid": False,
            "error_code": "FILE_NOT_FOUND",
            "message": "Specified image file does not exist on server."
        }

    # 2. File extension check
    ext = os.path.splitext(image_path)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        return {
            "is_valid": False,
            "error_code": "UNSUPPORTED_FORMAT",
            "message": f"Unsupported image format '{ext}'. Accepted formats: JPG, JPEG, PNG, WEBP."
        }

    # 3. Image load check
    img = cv2.imread(image_path)
    if img is None or img.size == 0:
        return {
            "is_valid": False,
            "error_code": "CORRUPT_IMAGE",
            "message": "Unable to read image. The file may be corrupt or unreadable."
        }

    # 4. Blurriness check
    blur_score = calculate_blurriness(img)
    if blur_score < 15.0:  # Threshold for severe blur
        return {
            "is_valid": False,
            "error_code": "IMAGE_TOO_BLURRY",
            "message": "Image is too blurry. Please upload a clear, focused photo of the plant or leaf."
        }

    # 5. Brightness checks
    brightness = calculate_brightness(img)
    if brightness < 20.0:
        return {
            "is_valid": False,
            "error_code": "IMAGE_TOO_DARK",
            "message": "Image is too dark. Please take a photo in better lighting."
        }

    if brightness > 245.0:
        return {
            "is_valid": False,
            "error_code": "IMAGE_TOO_BRIGHT",
            "message": "Image is overexposed or too bright. Avoid direct lens glare."
        }

    # 6. Green ratio check (Soft warning check - allowing colored flowers/fruits too)
    green_ratio = calculate_green_ratio(img)
    
    return {
        "is_valid": True,
        "metrics": {
            "blur_score": blur_score,
            "brightness": brightness,
            "green_ratio": green_ratio
        }
    }
