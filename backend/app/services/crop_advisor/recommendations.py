from datetime import timezone
"""
Crop Advisor — Treatment Recommendations Module.
Generates organic, chemical, mechanical, and biological treatment plans
by reading from the knowledge base and integrating with the Agrochemical Scanner.
"""

import logging
from typing import Dict, List, Any
from backend.app.services.crop_advisor.utils import get_disease_entry, get_defaults

logger = logging.getLogger(__name__)


def generate_treatment_plan(
    disease_name: str,
    crop_name: str,
    severity_level: str
) -> Dict[str, Any]:
    """
    Generate comprehensive treatment recommendations based on disease and severity.
    Includes recommended agrochemical products from the existing scanner database.
    """
    disease_entry = get_disease_entry(disease_name)
    defaults = get_defaults()
    
    # Retrieve treatment lists from KB, fallback to defaults
    kb_treatments = disease_entry.get("treatments", {})
    def_treatments = defaults.get("treatments", {})
    
    organic = kb_treatments.get("organic", def_treatments.get("organic", []))
    chemical = kb_treatments.get("chemical", def_treatments.get("chemical", []))
    mechanical = kb_treatments.get("mechanical", def_treatments.get("mechanical", []))
    biological = kb_treatments.get("biological", def_treatments.get("biological", []))

    # Determine recommended treatment focus based on severity
    focus = "organic"
    if severity_level in ["Moderate"]:
        focus = "integrated (organic + chemical)"
    elif severity_level in ["High", "Critical"]:
        focus = "chemical"
        
    # Get specific agrochemical recommendations if applicable
    agrochemicals = []
    try:
        from backend.app.services.agrochemical_detector import get_recommended_agrochemicals_for_disease
        agro_result = get_recommended_agrochemicals_for_disease(disease_name)
        if agro_result and "recommendations" in agro_result:
            agrochemicals = agro_result["recommendations"]
    except Exception as e:
        logger.warning(f"Could not load agrochemical recommendations: {e}")

    # Empty plan for healthy plants
    if severity_level == "Healthy":
        return {
            "focus": "maintenance",
            "organic": organic,
            "chemical": chemical,
            "mechanical": mechanical,
            "biological": biological,
            "recommended_agrochemicals": []
        }

    return {
        "focus": focus,
        "organic": organic,
        "chemical": chemical,
        "mechanical": mechanical,
        "biological": biological,
        "recommended_agrochemicals": agrochemicals
    }
