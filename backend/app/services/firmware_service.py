import os
import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional, Tuple, Any, Dict
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

# Base directories
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIRMWARE_STORAGE_DIR = os.path.join(BACKEND_DIR, "uploads", "firmware")

def get_firmware_storage_dir() -> str:
    """Ensure firmware storage directory exists and return its path."""
    os.makedirs(FIRMWARE_STORAGE_DIR, exist_ok=True)
    return FIRMWARE_STORAGE_DIR

def parse_version(v: str) -> Tuple[int, ...]:
    """
    Parse semantic version string (e.g., 'v2.1.0' or '2.4') into integer tuple for comparison.
    Non-numeric segments or build tags are ignored safely.
    """
    if not v:
        return (0, 0, 0)
    v_clean = str(v).strip().lstrip('vV')
    parts = []
    for part in v_clean.split('.'):
        num_str = ''
        for char in part:
            if char.isdigit():
                num_str += char
            else:
                break
        parts.append(int(num_str) if num_str else 0)
    while len(parts) < 3:
        parts.append(0)
    return tuple(parts[:3])

def compare_versions(v1: str, v2: str) -> int:
    """
    Compare semantic version strings v1 and v2.
    Returns:
       1 if v1 > v2
      -1 if v1 < v2
       0 if v1 == v2
    """
    p1 = parse_version(v1)
    p2 = parse_version(v2)
    if p1 > p2:
        return 1
    elif p1 < p2:
        return -1
    else:
        return 0

def calculate_sha256(content: bytes) -> str:
    """Calculate cryptographic SHA-256 hex checksum of binary content."""
    sha256_hash = hashlib.sha256()
    sha256_hash.update(content)
    return sha256_hash.hexdigest().lower()

def is_hardware_compatible(device_model: Optional[str], firmware_model: str) -> bool:
    """
    Validate whether a firmware release targets the device's hardware model.
    Supports wildcard ('*', 'all', 'any') matching.
    """
    if not firmware_model or firmware_model.strip() in ["*", "all", "any", "ALL"]:
        return True
    if not device_model:
        device_model = "ESP32 DevKit V1"
    
    dm = str(device_model).lower().strip()
    fm = str(firmware_model).lower().strip()
    
    if dm == fm or dm in fm or fm in dm:
        return True
    return False

def validate_firmware_file(filename: str, content: bytes, max_size_bytes: int = 4 * 1024 * 1024):
    """
    Validate firmware upload format, file extension (.bin), file size (max 4MB),
    and ESP32 binary magic byte (0xE9 at index 0).
    """
    if not filename or not filename.lower().endswith(".bin"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file extension. Only .bin firmware files are permitted."
        )
        
    size = len(content)
    if size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded firmware binary is empty."
        )
        
    if size > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Firmware file size ({size} bytes) exceeds maximum limit of {max_size_bytes} bytes (4MB)."
        )
        
    # Verify ESP32 image magic byte header (0xE9)
    if content[0] != 0xE9:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ESP32 firmware binary format (magic byte 0xE9 not found at offset 0)."
        )

async def log_ota_audit(db: Any, action: str, actor: str, details: Dict[str, Any]):
    """Record an audit log entry for OTA firmware lifecycle operations."""
    try:
        if db is not None:
            await db["ota_audit_logs"].insert_one({
                "action": action,
                "timestamp": datetime.now(timezone.utc),
                "actor": actor,
                "details": details
            })
    except Exception as e:
        logger.error(f"Failed to record OTA audit log: {e}")
