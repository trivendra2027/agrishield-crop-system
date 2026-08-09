import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from backend.app.services.weather import WeatherIntelligenceService
from backend.app.services.irrigation import SmartIrrigationService
from backend.app.services.risk_forecast import DiseaseRiskForecastService

logger = logging.getLogger(__name__)

class DailyRecommendationsService:
    def __init__(self, weather_service=None, irrigation_service=None, risk_service=None):
        self.weather_service = weather_service or WeatherIntelligenceService()
        self.irrigation_service = irrigation_service or SmartIrrigationService(weather_service=self.weather_service)
        self.risk_service = risk_service or DiseaseRiskForecastService(weather_service=self.weather_service)

    async def generate_daily_recommendations(
        self,
        farm_id: Optional[str] = None,
        crop_name: str = "Tomato",
        growth_stage: str = "Vegetative",
        farm_size: float = 1.0,
        lat: float = 28.6139,
        lon: float = 77.2090
    ) -> Dict[str, Any]:
        start_time = time.time()
        now_iso = datetime.now(timezone.utc).isoformat() + "Z"

        # Gather inputs from intelligence services
        weather = await self.weather_service.get_weather_for_farm(farm_id=farm_id, lat=lat, lon=lon)
        irrigation = await self.irrigation_service.calculate_irrigation_recommendation(
            farm_id=farm_id, crop_name=crop_name, growth_stage=growth_stage, farm_size_acres=farm_size, lat=lat, lon=lon
        )
        risk = await self.risk_service.calculate_disease_risk(farm_id=farm_id, crop_name=crop_name, lat=lat, lon=lon)

        items: List[Dict[str, Any]] = []

        # 1. Weather & Rain Alert Recommendation
        rain_prob = weather["current"]["rain_probability"]
        if rain_prob > 50:
            items.append({
                "id": "rec_rain_warning",
                "recommendation": f"Rain Expected Today ({rain_prob:.0f}% chance). Delay chemical sprays.",
                "confidence": 96.0,
                "reasoning": [
                    f"Precipitation probability is elevated at {rain_prob:.0f}%.",
                    "Foliar chemical sprays would be washed off before plant absorption."
                ],
                "priority": "High",
                "category": "Weather",
                "generated_at": now_iso
            })

        # 2. Disease Prevention Recommendation
        if risk["risk_percentage"] >= 50:
            items.append({
                "id": "rec_spray_mancozeb",
                "recommendation": f"Spray Mancozeb 75% WP or Neem Oil solution on {crop_name}.",
                "confidence": risk["confidence_score"],
                "reasoning": risk["factors_increasing_risk"],
                "priority": "Critical" if risk["risk_percentage"] >= 75 else "High",
                "category": "Disease Risk",
                "generated_at": now_iso
            })
        else:
            items.append({
                "id": "rec_monitor_foliage",
                "recommendation": f"Monitor {crop_name} lower leaf canopy for chlorotic spotting.",
                "confidence": 91.0,
                "reasoning": ["Disease risk is currently within moderate/low threshold."],
                "priority": "Low",
                "category": "Monitoring",
                "generated_at": now_iso
            })

        # 3. Irrigation Recommendation
        items.append({
            "id": "rec_irrigation",
            "recommendation": irrigation["recommendation"],
            "confidence": irrigation["confidence_score"],
            "reasoning": irrigation["reasoning"],
            "priority": "High" if irrigation["irrigation_required"] else "Medium",
            "category": "Irrigation",
            "generated_at": now_iso
        })

        # 4. Crop Calendar & Stage Recommendation
        items.append({
            "id": "rec_fertilizer",
            "recommendation": f"Apply balanced N-P-K fertilizer suitable for {growth_stage} stage.",
            "confidence": 90.0,
            "reasoning": [f"{crop_name} is actively in {growth_stage} stage requiring nitrogen support."],
            "priority": "Medium",
            "category": "Nutrition",
            "generated_at": now_iso
        })

        processing_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "metadata": {
                "api_version": "1.0",
                "generated_at": now_iso,
                "processing_time_ms": processing_time_ms,
                "cache_status": "Live",
                "cache_expires_in": 1800
            },
            "recommendations": items
        }
