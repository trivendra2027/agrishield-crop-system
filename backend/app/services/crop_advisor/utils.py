"""
Crop Advisor — Utility Functions & Knowledge Base Loader.
Centralizes JSON KB loading, caching, key normalization, season detection, and metadata access.
"""

import os
import re
import json
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# ── Module-level cached knowledge base ──────────────────────────────────────

_knowledge_base = None
_KB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data", "crop_advisor_db.json"
)


def load_knowledge_base() -> dict:
    """Load and cache the crop advisor knowledge base from JSON file."""
    global _knowledge_base
    if _knowledge_base is not None:
        return _knowledge_base

    try:
        with open(_KB_PATH, "r", encoding="utf-8") as f:
            _knowledge_base = json.load(f)
        logger.info(f"Crop Advisor KB loaded: v{_knowledge_base.get('version', '?')} ({_KB_PATH})")
    except FileNotFoundError:
        logger.error(f"Crop Advisor KB not found at {_KB_PATH}")
        _knowledge_base = {"diseases": {}, "crops": {}, "defaults": {}}
    except json.JSONDecodeError as e:
        logger.error(f"Crop Advisor KB JSON parse error: {e}")
        _knowledge_base = {"diseases": {}, "crops": {}, "defaults": {}}

    return _knowledge_base


def get_kb_metadata() -> dict:
    """Return top-level metadata from the knowledge base."""
    kb = load_knowledge_base()
    return {
        "version": kb.get("version", "unknown"),
        "last_updated": kb.get("last_updated", "unknown"),
        "default_language": kb.get("default_language", "en"),
    }


# ── Disease Key Normalization ───────────────────────────────────────────────

def normalize_disease_key(disease_name: str) -> str:
    """
    Convert a display disease name to a knowledge base lookup key.
    Examples:
      'Tomato Early Blight' → 'early_blight'
      'Potato___Late_Blight' → 'late_blight'
      'Apple Scab' → 'apple_scab'
      'Corn_(maize)___Common_Rust_' → 'common_rust'
    """
    if not disease_name:
        return ""

    name = disease_name.lower().strip()

    # Remove crop prefixes (e.g., "tomato", "potato", "corn_(maize)")
    crop_prefixes = [
        r"tomato\s*", r"potato\s*", r"corn\s*", r"maize\s*", r"corn_?\(maize\)\s*",
        r"rice\s*", r"apple\s*", r"grape\s*", r"wheat\s*", r"pepper\s*",
        r"cherry\s*", r"strawberry\s*", r"peach\s*", r"soybean\s*",
        r"squash\s*", r"cucumber\s*", r"mango\s*",
    ]
    for prefix in crop_prefixes:
        name = re.sub(rf"^{prefix}[_\-]*", "", name)

    # Remove trailing/leading underscores and special characters
    name = re.sub(r"[_\-]+", "_", name)
    name = re.sub(r"[^a-z0-9_\s]", "", name)
    name = name.strip("_ ")

    # Replace spaces with underscores
    name = re.sub(r"\s+", "_", name)

    return name


def get_disease_entry(disease_name: str) -> dict:
    """Look up a disease entry from the KB, falling back to defaults."""
    kb = load_knowledge_base()
    key = normalize_disease_key(disease_name)

    # Direct key match
    if key in kb.get("diseases", {}):
        return kb["diseases"][key]

    # Partial match — check if key is a substring of any KB disease key or vice versa
    for db_key, entry in kb.get("diseases", {}).items():
        if db_key in key or key in db_key:
            return entry
        # Also check display_name
        if key.replace("_", " ") in entry.get("display_name", "").lower():
            return entry

    # Check for 'healthy' status
    if "healthy" in disease_name.lower():
        return kb.get("diseases", {}).get("healthy", {})

    return {}


# ── Season Detection ────────────────────────────────────────────────────────

def get_current_season() -> str:
    """Determine current agricultural season from calendar month."""
    month = datetime.now().month
    if month in (3, 4, 5):
        return "Spring"
    elif month in (6, 7, 8):
        return "Summer / Monsoon"
    elif month in (9, 10, 11):
        return "Autumn / Post-Monsoon"
    else:
        return "Winter / Rabi"


# ── Crop Metadata ───────────────────────────────────────────────────────────

def get_crop_metadata(crop_name: str) -> dict:
    """
    Look up crop metadata from the KB. Falls back to plant_information.py if not in KB.
    """
    kb = load_knowledge_base()
    key = crop_name.lower().strip()

    # Direct KB lookup
    if key in kb.get("crops", {}):
        return kb["crops"][key]

    # Try partial match
    for crop_key, entry in kb.get("crops", {}).items():
        if crop_key in key or key in crop_key:
            return entry

    # Fallback to plant_information.py knowledge base
    try:
        from backend.app.services.plant_identifier.plant_information import get_plant_info
        plant_info = get_plant_info(crop_name)
        return {
            "scientific_name": plant_info.get("scientific_name", f"{crop_name.title()} spp."),
            "family": plant_info.get("family", "Botanical Family"),
            "typical_growth_stages": ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest"],
            "source": "Plant Identification Knowledge Base"
        }
    except Exception:
        pass

    return {
        "scientific_name": f"{crop_name.title()} spp.",
        "family": "Agricultural Crop",
        "typical_growth_stages": ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest"],
        "source": "Dynamic fallback"
    }


def get_entry_source(entry: dict) -> str:
    """Return the source attribution field from a disease or crop KB entry."""
    return entry.get("source", "AgriShield AI Knowledge Base")


def get_defaults() -> dict:
    """Return the defaults section from the KB."""
    kb = load_knowledge_base()
    return kb.get("defaults", {})
