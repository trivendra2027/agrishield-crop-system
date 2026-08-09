from datetime import timezone
import os
import hashlib
import cv2
import numpy as np

def compute_image_hash(image_path: str) -> str:
    """Computes SHA256 hash of image file for caching."""
    hasher = hashlib.sha256()
    try:
        with open(image_path, 'rb') as f:
            while chunk := f.read(8192):
                hasher.update(chunk)
        return hasher.hexdigest()
    except Exception:
        return ""

def calculate_blurriness(image_cv: np.ndarray) -> float:
    """Calculates image blurriness using OpenCV Laplacian variance."""
    try:
        gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
        return float(cv2.Laplacian(gray, cv2.CV_64F).var())
    except Exception:
        return 100.0

def calculate_brightness(image_cv: np.ndarray) -> float:
    """Calculates mean brightness of image (0 to 255)."""
    try:
        gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
        return float(gray.mean())
    except Exception:
        return 128.0

def calculate_green_ratio(image_cv: np.ndarray) -> float:
    """Calculates green pixel ratio using HSV color space."""
    try:
        hsv = cv2.cvtColor(image_cv, cv2.COLOR_BGR2HSV)
        # Green HSV range
        lower_green = np.array([25, 30, 30])
        upper_green = np.array([95, 255, 255])
        mask = cv2.inRange(hsv, lower_green, upper_green)
        green_pixels = np.count_nonzero(mask)
        total_pixels = image_cv.shape[0] * image_cv.shape[1]
        return float(green_pixels / total_pixels) if total_pixels > 0 else 0.0
    except Exception:
        return 0.5
