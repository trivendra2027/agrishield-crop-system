from datetime import timezone
"""
Crop Advisor — Severity Assessment Module.
Determines disease severity level from confidence, disease type, and uncertainty score.
All thresholds are loaded from the centralized JSON knowledge base.
"""

import logging
from backend.app.services.crop_advisor.utils import get_disease_entry, get_defaults

logger = logging.getLogger(__name__)

# Severity level definitions with visual properties
SEVERITY_LEVELS = {
    "Healthy":  {"color": "#10b981", "icon": "✅", "urgency_score": 0,  "description": "No disease detected. Plant is healthy."},
    "Low":      {"color": "#34d399", "icon": "🟢", "urgency_score": 25, "description": "Minor infection detected. Monitor closely and apply preventive measures."},
    "Moderate": {"color": "#fbbf24", "icon": "🟡", "urgency_score": 50, "description": "Moderate infection spreading. Begin treatment immediately to contain."},
    "High":     {"color": "#f97316", "icon": "🟠", "urgency_score": 75, "description": "Severe infection. Urgent treatment required to prevent major crop loss."},
    "Critical": {"color": "#ef4444", "icon": "🔴", "urgency_score": 100, "description": "Critical infection level. Emergency intervention needed. Risk of total crop loss."},
}


def assess_severity(
    disease_name: str,
    confidence: float,
    prediction_status: str = "diseased",
    uncertainty_score: float = 0.0
) -> dict:
    """
    Assess disease severity based on confidence, disease thresholds from KB, and prediction status.

    Returns:
        {
            "level": "Moderate",
            "color": "#fbbf24",
            "icon": "🟡",
            "description": "...",
            "urgency_score": 50,
            "confidence_percent": 75.0
        }
    """
    # Healthy plant — no disease
    if prediction_status == "healthy" or "healthy" in disease_name.lower():
        info = SEVERITY_LEVELS["Healthy"]
        return {
            "level": "Healthy",
            "color": info["color"],
            "icon": info["icon"],
            "description": info["description"],
            "urgency_score": info["urgency_score"],
            "confidence_percent": round(confidence * 100, 1) if confidence <= 1.0 else round(confidence, 1),
        }

    # Normalize confidence to 0-1 range if needed
    conf = confidence if confidence <= 1.0 else confidence / 100.0

    # Look up disease-specific thresholds from KB
    disease_entry = get_disease_entry(disease_name)
    thresholds = disease_entry.get("severity_thresholds", {})

    if not thresholds:
        # Use sensible defaults
        thresholds = {"low": 0.55, "moderate": 0.70, "high": 0.85, "critical": 0.93}

    # Apply uncertainty penalty — higher uncertainty reduces effective confidence
    effective_conf = conf - (uncertainty_score * 0.1)  # mild penalty

    # Determine severity level
    if effective_conf >= thresholds.get("critical", 0.93):
        level = "Critical"
    elif effective_conf >= thresholds.get("high", 0.85):
        level = "High"
    elif effective_conf >= thresholds.get("moderate", 0.70):
        level = "Moderate"
    elif effective_conf >= thresholds.get("low", 0.55):
        level = "Low"
    else:
        level = "Low"  # Even low-confidence detections deserve monitoring

    info = SEVERITY_LEVELS[level]
    return {
        "level": level,
        "color": info["color"],
        "icon": info["icon"],
        "description": info["description"],
        "urgency_score": info["urgency_score"],
        "confidence_percent": round(conf * 100, 1),
    }
