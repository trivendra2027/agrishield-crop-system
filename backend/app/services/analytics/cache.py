from datetime import timezone
import time
from typing import Any, Optional

class TTLCache:
    """
    A simple thread-safe, in-memory TTL (Time-To-Live) cache.
    Stores cached items with an expiration timestamp.
    """
    def __init__(self, default_ttl_seconds: int = 300):
        self._cache = {}
        self.default_ttl = default_ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        """Retrieve an item from the cache if it hasn't expired."""
        if key in self._cache:
            item, expires_at = self._cache[key]
            if time.time() < expires_at:
                return item
            else:
                # Expired
                del self._cache[key]
        return None

    def set(self, key: str, value: Any, ttl_seconds: int = None):
        """Set an item in the cache with a TTL."""
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        self._cache[key] = (value, time.time() + ttl)

    def clear(self):
        """Clear all cached items."""
        self._cache.clear()

    def invalidate(self, key: str):
        """Invalidate a specific key."""
        if key in self._cache:
            del self._cache[key]

# Singleton instance
analytics_cache = TTLCache(default_ttl_seconds=300)  # 5 minutes default
