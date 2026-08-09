from datetime import timezone
import time
from typing import Dict, List, Callable
from fastapi import Request, Response, HTTPException, status
from backend.app.core.config import settings

_request_buckets: Dict[str, List[float]] = {}

AUTH_LIMIT = 5
PREDICT_LIMIT = 15
AI_CHAT_LIMIT = 25
IOT_LIMIT = 60
ADMIN_LIMIT = 30

def check_rate_limit(key: str, max_requests: int, window_seconds: int = 60) -> bool:
    now = time.time()
    cutoff = now - window_seconds
    timestamps = _request_buckets.setdefault(key, [])
    timestamps = [t for t in timestamps if t > cutoff]
    if len(timestamps) >= max_requests:
        _request_buckets[key] = timestamps
        return False
    timestamps.append(now)
    _request_buckets[key] = timestamps
    return True

def rate_limit(max_requests: int, window_seconds: int = 60, key_func: Callable[[Request], str] = None):
    async def dependency(request: Request):
        if key_func:
            key_suffix = key_func(request)
        else:
            client_ip = request.client.host if request.client else "127.0.0.1"
            key_suffix = client_ip

        rate_key = f"{request.url.path}:{key_suffix}"
        if not check_rate_limit(rate_key, max_requests, window_seconds):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: maximum {max_requests} requests per {window_seconds} seconds."
            )
    return dependency

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    limiter = Limiter(key_func=get_remote_address)
except ImportError:
    limiter = None
