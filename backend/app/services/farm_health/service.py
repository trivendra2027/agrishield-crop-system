import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from backend.app.services.weather import WeatherIntelligenceService

logger = logging.getLogger(__name__)

class FarmHealthService:
    def __init__(self, weather_service=None):
        self.weather_service = weather_service or WeatherIntelligenceService()

    async def calculate_health_score_2(
        self,
        farm_id: Optional[str] = None,
        diseased_ratio: float = 0.15,
        lat: float = 28.6139,
        lon: float = 77.2090
    ) -> Dict[str, Any]:
        start_time = time.time()

        # Fetch weather stability factor
        weather = await self.weather_service.get_weather_for_farm(farm_id=farm_id, lat=lat, lon=lon)
        rain_prob = weather["current"]["rain_probability"]

        # Component contributions (Max weights summing up to 100)
        # 1. Disease History Contribution (Max 35)
        disease_score = round(max(0.0, 35.0 * (1.0 - diseased_ratio)), 1)

        # 2. Weather Stability Contribution (Max 20)
        weather_score = round(20.0 if rain_prob < 40 else 12.0, 1)

        # 3. Irrigation Consistency Contribution (Max 15)
        irrigation_score = 14.0

        # 4. Crop Growth Progress Contribution (Max 10)
        growth_score = 9.5

        # 5. Recovery Trend Contribution (Max 10)
        recovery_score = 8.5

        # 6. AI Model Confidence Contribution (Max 10)
        ai_confidence_score = 9.0

        total_score = int(round(disease_score + weather_score + irrigation_score + growth_score + recovery_score + ai_confidence_score))
        overall = min(100, max(0, total_score))
        previous = max(0, overall - 4)

        suggestions = []
        if diseased_ratio > 0.2:
            suggestions.append("Apply targeted copper fungicide spray to curtail ongoing leaf spot spread.")
        if rain_prob > 50:
            suggestions.append("Ensure field perimeter drainage ditches are clear ahead of expected rain.")
        if irrigation_score < 12:
            suggestions.append("Adjust drip irrigation timer to prevent moisture stress during afternoon heat.")
        if len(suggestions) == 0:
            suggestions.append("Maintain existing agronomic nutrient and irrigation schedules.")

        processing_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "metadata": {
                "api_version": "1.0",
                "generated_at": datetime.now(timezone.utc).isoformat() + "Z",
                "processing_time_ms": processing_time_ms,
                "cache_status": "Live",
                "cache_expires_in": 1800
            },
            "overall_score": overall,
            "previous_score": previous,
            "trend": "up" if overall >= previous else "down",
            "breakdown": {
                "disease_history_contribution": disease_score,
                "weather_contribution": weather_score,
                "irrigation_contribution": irrigation_score,
                "crop_growth_contribution": growth_score,
                "recovery_contribution": recovery_score,
                "ai_confidence_contribution": ai_confidence_score
            },
            "improvement_suggestions": suggestions
        }
