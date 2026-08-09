from datetime import timezone
"""
Crop Advisor — Advisory Tips & Prevention Module.
Generates farmer tips, preventive measures, and spray timing recommendations.
"""

from typing import Dict, List, Any
from backend.app.services.crop_advisor.utils import get_disease_entry, get_defaults, get_current_season


def generate_prevention_measures(crop_name: str, disease_name: str) -> List[str]:
    """Retrieve preventive measures for the disease from KB."""
    disease_entry = get_disease_entry(disease_name)
    defaults = get_defaults()
    
    prevention = disease_entry.get("prevention", [])
    if not prevention:
        prevention = defaults.get("prevention", [])
        
    return prevention


def generate_farmer_tips(crop_name: str, disease_name: str, severity_level: str) -> List[str]:
    """Retrieve practical farming tips and inject seasonal awareness."""
    disease_entry = get_disease_entry(disease_name)
    defaults = get_defaults()
    
    tips = disease_entry.get("tips", [])
    if not tips:
        tips = defaults.get("tips", [])
        
    # Inject a dynamic seasonal tip
    season = get_current_season()
    seasonal_tip = f"Current Season ({season}): Adjust irrigation schedules based on local {season.lower()} weather patterns to avoid excess moisture."
    
    if seasonal_tip not in tips:
        # Create a new list to avoid modifying the cached dict
        tips = list(tips)
        tips.append(seasonal_tip)
        
    return tips


def get_spray_recommendation(disease_name: str, severity_level: str) -> Dict[str, Any]:
    """Retrieve optimal spray timing and weather warnings."""
    if severity_level == "Healthy":
        return {
            "best_time": "No urgent spray needed",
            "avoid_rain_hours": 0,
            "wind_warning": "N/A",
            "interval_days": 0
        }
        
    disease_entry = get_disease_entry(disease_name)
    defaults = get_defaults()
    
    spray_info = disease_entry.get("spray", {})
    if not spray_info:
        spray_info = defaults.get("spray", {})
        
    return {
        "best_time": spray_info.get("best_time", "Early morning or late evening"),
        "avoid_rain_hours": spray_info.get("avoid_rain_hours", 4),
        "wind_warning": spray_info.get("wind_warning", "Avoid spraying in high winds"),
        "interval_days": spray_info.get("interval_days", 7)
    }
