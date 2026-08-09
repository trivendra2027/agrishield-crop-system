from datetime import timezone
import torch
import numpy as np

def get_device() -> torch.device:
    """
    Selects CUDA GPU if available, else CPU.
    """
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")

def calibrate_probabilities(probs: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """
    Applies temperature scaling to output probabilities.
    """
    if temperature <= 0 or temperature == 1.0:
        return probs
    probs = np.clip(probs, 1e-7, 1.0 - 1e-7)
    logits = np.log(probs)
    scaled_logits = logits / temperature
    exp_logits = np.exp(scaled_logits - np.max(scaled_logits, axis=-1, keepdims=True))
    return exp_logits / np.sum(exp_logits, axis=-1, keepdims=True)
