from datetime import timezone
"""
Crop Advisor — Main Orchestration Service.
Combines Plant ID, Disease Diagnosis, and Agrochemical recommendations
into a single, structured advisory JSON.
"""

import logging
from typing import Dict, Any

from backend.app.services.crop_advisor.utils import get_crop_metadata, get_kb_metadata
from backend.app.services.crop_advisor.severity import assess_severity
from backend.app.services.crop_advisor.recommendations import generate_treatment_plan
from backend.app.services.crop_advisor.recovery import estimate_recovery
from backend.app.services.crop_advisor.tips import generate_prevention_measures, generate_farmer_tips, get_spray_recommendation

logger = logging.getLogger(__name__)

class CropAdvisorService:
    def generate_advisory(
        self,
        crop_name: str,
        disease_name: str,
        confidence: float,
        prediction_status: str = "diseased",
        uncertainty_score: float = 0.0
    ) -> Dict[str, Any]:
        """
        Generate full crop advisory by aggregating all sub-modules.
        """
        logger.info(f"Generating crop advisory for {crop_name} - {disease_name}")
        
        # 1. KB Metadata
        kb_meta = get_kb_metadata()

        # 2. Crop Summary
        crop_meta = get_crop_metadata(crop_name)
        crop_summary = {
            "name": crop_name,
            "scientific_name": crop_meta.get("scientific_name", "Unknown"),
            "growth_stages": crop_meta.get("typical_growth_stages", []),
            "source": crop_meta.get("source", "Unknown")
        }

        # 3. Disease Severity
        severity_data = assess_severity(
            disease_name=disease_name,
            confidence=confidence,
            prediction_status=prediction_status,
            uncertainty_score=uncertainty_score
        )
        
        level = severity_data["level"]

        # 4. Treatment Recommendations
        treatment_plan = generate_treatment_plan(
            disease_name=disease_name,
            crop_name=crop_name,
            severity_level=level
        )

        # 5. Spray Advice
        spray_advice = get_spray_recommendation(
            disease_name=disease_name,
            severity_level=level
        )

        # 6. Recovery Estimate
        recovery_estimate = estimate_recovery(
            disease_name=disease_name,
            severity_level=level,
            crop_name=crop_name
        )

        # 7. Prevention & Tips
        prevention = generate_prevention_measures(
            crop_name=crop_name,
            disease_name=disease_name
        )
        tips = generate_farmer_tips(
            crop_name=crop_name,
            disease_name=disease_name,
            severity_level=level
        )

        return {
            "kb_version": kb_meta.get("version"),
            "crop": crop_summary,
            "severity": severity_data,
            "treatment": treatment_plan,
            "spray": spray_advice,
            "recovery": recovery_estimate,
            "prevention": prevention,
            "tips": tips
        }

# Singleton instance
crop_advisor_service = CropAdvisorService()
