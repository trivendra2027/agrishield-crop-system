from datetime import timezone
import time
import logging

logger = logging.getLogger(__name__)

class PlantIdentifierCache:
    """
    In-memory & hash-based cache for Plant Identification service.
    Stores identification results keyed by image SHA256 hash or plant key.
    """

    def __init__(self, ttl_seconds: int = 86400): # Default 24 hour TTL
        self._cache = {}
        self.ttl = ttl_seconds

    def get(self, image_hash: str) -> dict:
        """Retrieves cached plant identification result if valid."""
        if not image_hash or image_hash not in self._cache:
            return None

        entry = self._cache[image_hash]
        if time.time() - entry["timestamp"] > self.ttl:
            logger.info(f"Cache expired for hash: {image_hash[:10]}")
            del self._cache[image_hash]
            return None

        logger.info(f"Cache HIT for image hash: {image_hash[:10]}")
        return entry["data"]

    def set(self, image_hash: str, data: dict):
        """Saves plant identification result into cache."""
        if not image_hash or not data:
            return

        self._cache[image_hash] = {
            "data": data,
            "timestamp": time.time()
        }
        logger.info(f"Cached identification result for hash: {image_hash[:10]}")

    def clear(self):
        """Clears all cached entries."""
        self._cache.clear()

# Global Singleton Cache Instance
plant_cache = PlantIdentifierCache()
