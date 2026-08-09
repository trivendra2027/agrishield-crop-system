import time
from datetime import datetime, timedelta
from typing import Dict, List
from backend.app.core.config import settings

_failed_attempts: Dict[str, List[float]] = {}
_lockouts: Dict[str, float] = {}

def is_account_locked(identifier: str) -> bool:
    now = time.time()
    if identifier in _lockouts:
        lock_until = _lockouts[identifier]
        if now < lock_until:
            return True
        else:
            del _lockouts[identifier]
            _failed_attempts.pop(identifier, None)
    return False

def get_remaining_lockout_seconds(identifier: str) -> int:
    now = time.time()
    if identifier in _lockouts:
        rem = _lockouts[identifier] - now
        return max(0, int(rem))
    return 0

def record_failed_login(identifier: str) -> int:
    now = time.time()
    window = 15 * 60
    attempts = _failed_attempts.setdefault(identifier, [])
    attempts = [t for t in attempts if now - t < window]
    attempts.append(now)
    _failed_attempts[identifier] = attempts
    if len(attempts) >= settings.MAX_LOGIN_ATTEMPTS:
        lock_duration = settings.LOCKOUT_DURATION_MINUTES * 60
        _lockouts[identifier] = now + lock_duration
        return len(attempts)
    return len(attempts)

def record_successful_login(identifier: str):
    _failed_attempts.pop(identifier, None)
    _lockouts.pop(identifier, None)

def clear_all_lockouts():
    _failed_attempts.clear()
    _lockouts.clear()

def get_progressive_delay(attempts_count: int) -> float:
    if attempts_count <= 1:
        return 0.0
    return min(5.0, 0.5 * (2 ** (attempts_count - 2)))
