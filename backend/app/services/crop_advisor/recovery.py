from datetime import timezone
"""
Crop Advisor — Recovery Estimation Module.
Estimates recovery timelines, risk levels, and probabilities based on disease severity.
"""

from typing import Dict, Any
from backend.app.services.crop_advisor.utils import get_disease_entry, get_defaults

def estimate_recovery(disease_name: str, severity_level: str, crop_name: str) -> Dict[str, Any]:
    """
    Estimate recovery time, risk, and probability based on KB parameters and severity level.
    """
    if severity_level == "Healthy":
        return {
            "expected_days": 0,
            "risk_level": "None",
            "recovery_probability": 1.0,
            "status": "Healthy"
        }
        
    disease_entry = get_disease_entry(disease_name)
    defaults = get_defaults()
    
    # Map 'severity_level' string (e.g., "High") to KB key (e.g., "high")
    severity_key = severity_level.lower()
    
    kb_recovery = disease_entry.get("recovery", {})
    def_recovery = defaults.get("recovery", {})
    
    # Expected days
    kb_days = kb_recovery.get("expected_days", {})
    def_days = def_recovery.get("expected_days", {})
    expected_days = kb_days.get(severity_key, def_days.get(severity_key, 14))
    
    # Risk level
    kb_risk = kb_recovery.get("risk_level", {})
    def_risk = def_recovery.get("risk_level", {})
    risk_level = kb_risk.get(severity_key, def_risk.get(severity_key, "Moderate"))
    
    # Probability
    kb_prob = kb_recovery.get("probability", {})
    def_prob = def_recovery.get("probability", {})
    probability = kb_prob.get(severity_key, def_prob.get(severity_key, 0.75))
    
    return {
        "expected_days": expected_days,
        "risk_level": risk_level,
        "recovery_probability": probability,
        "status": "Infected"
    }
