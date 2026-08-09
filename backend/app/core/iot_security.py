from datetime import timezone
import time
from typing import Dict, Any, Tuple
from fastapi import Request, HTTPException, status
from backend.app.core.config import settings

# Sensor Physical Bounds Configuration
SENSOR_BOUNDS = {
    "temperature": (-10.0, 65.0),    # Celsius
    "humidity": (0.0, 100.0),         # Percentage
    "soil_moisture": (0.0, 100.0),    # Percentage
    "light_lux": (0.0, 100000.0),     # Lux
    "voltage": (0.0, 15.0),           # Volts
    "pressure": (800.0, 1200.0)       # hPa
}

def validate_sensor_payload(payload: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validate telemetry data ranges against physical limits.
    Rejects physically impossible values (e.g. 500°C temp or -20% humidity).
    """
    if not isinstance(payload, dict):
        return False, "Payload must be a JSON object"

    for sensor_key, (min_val, max_val) in SENSOR_BOUNDS.items():
        if sensor_key in payload and payload[sensor_key] is not None:
            try:
                val = float(payload[sensor_key])
                if val < min_val or val > max_val:
                    return False, f"Sensor '{sensor_key}' value {val} out of physical bounds [{min_val}, {max_val}]."
            except (ValueError, TypeError):
                return False, f"Sensor '{sensor_key}' value must be numeric."

    return True, "Sensor payload valid."

def validate_iot_request(request: Request, api_key: str = None, timestamp: float = None) -> bool:
    """
    Validate IoT node request authentication and replay protection.
    Permissive in development mode for seamless local ESP32 simulation.
    """
    # 1. API Key Check
    header_key = request.headers.get("X-IoT-API-Key") or api_key
    if settings.IOT_SECURITY_MODE == "production":
        if not header_key or header_key != settings.IOT_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing X-IoT-API-Key"
            )

    # 2. Timestamp Replay Protection Check
    if timestamp:
        now = time.time()
        # Accept timestamps within a 5-minute window
        if abs(now - timestamp) > 300:
            if settings.IOT_SECURITY_MODE == "production":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="IoT request timestamp expired or invalid (Replay attack protection)."
                )

    return True
