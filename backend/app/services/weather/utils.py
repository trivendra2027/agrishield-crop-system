import time
from datetime import datetime, timezone

def generate_standard_metadata(start_time: float, cache_status: str = "Live", cache_expires_in: int = 1800) -> dict:
    processing_time_ms = round((time.time() - start_time) * 1000, 2)
    return {
        "api_version": "1.0",
        "generated_at": datetime.now(timezone.utc).isoformat() + "Z",
        "processing_time_ms": processing_time_ms,
        "cache_status": cache_status,
        "cache_expires_in": cache_expires_in if cache_status == "Cached" else 1800
    }
