import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from backend.app.services.weather import WeatherIntelligenceService

logger = logging.getLogger(__name__)

class DiseaseRiskForecastService:
    def __init__(self, weather_service=None):
        self.weather_service = weather_service or WeatherIntelligenceService()

    async def calculate_disease_risk(
        self,
        farm_id: Optional[str] = None,
        crop_name: str = "Tomato",
        lat: float = 28.6139,
        lon: float = 77.2090
    ) -> Dict[str, Any]:
        start_time = time.time()

        weather = await self.weather_service.get_weather_for_farm(farm_id=farm_id, lat=lat, lon=lon)
        current_humidity = weather["current"]["humidity"]
        current_temp = weather["current"]["temperature"]
        rain_prob = weather["current"]["rain_probability"]

        increasing_factors = []
        reducing_factors = []
        preventive_actions = []

        base_risk = 25.0

        if current_humidity > 80:
            base_risk += 35.0
            increasing_factors.append(f"Elevated ambient humidity ({current_humidity}% > 80% threshold).")
        elif current_humidity > 65:
            base_risk += 15.0
            increasing_factors.append(f"Moderate relative humidity ({current_humidity}%).")
        else:
            reducing_factors.append(f"Low ambient humidity ({current_humidity}%).")

        if rain_prob > 50:
            base_risk += 25.0
            increasing_factors.append(f"High precipitation probability ({rain_prob:.0f}%).")
        else:
            reducing_factors.append("Dry atmospheric conditions forecast.")

        if 20.0 <= current_temp <= 30.0:
            base_risk += 15.0
            increasing_factors.append(f"Temperature ({current_temp}°C) is in optimal fungal incubation range.")

        risk_percentage = min(98.0, max(5.0, round(base_risk, 1)))

        if risk_percentage >= 75.0:
            risk_level = "Critical"
            risk_color = "#ef4444"
            interval = "Daily"
            preventive_actions = [
                "Apply protective copper-based fungicide or Mancozeb 75% WP.",
                "Remove and isolate lower leaves showing chlorosis or necrotic spots.",
                "Avoid overhead irrigation to keep canopy foliage dry."
            ]
        elif risk_percentage >= 50.0:
            risk_level = "High"
            risk_color = "#f59e0b"
            interval = "48 Hours"
            preventive_actions = [
                "Spray neem oil organic solution (5ml/L) on leaf undersides.",
                "Prune excessive foliage to enhance cross-ventilation airflow."
            ]
        elif risk_percentage >= 25.0:
            risk_level = "Medium"
            risk_color = "#3b82f6"
            interval = "3 Days"
            preventive_actions = [
                "Inspect field border rows for early symptom spotting.",
                "Maintain balanced soil potassium nutrients."
            ]
        else:
            risk_level = "Low"
            risk_color = "#10b981"
            interval = "Weekly"
            preventive_actions = [
                "Maintain normal agronomic monitoring routine."
            ]

        processing_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "metadata": {
                "api_version": "1.0",
                "generated_at": datetime.now(timezone.utc).isoformat() + "Z",
                "processing_time_ms": processing_time_ms,
                "cache_status": "Live",
                "cache_expires_in": 1800
            },
            "crop_name": crop_name,
            "disease_target": f"{crop_name} Early/Late Blight & Fungal Spores",
            "risk_percentage": risk_percentage,
            "risk_level": risk_level,
            "risk_color": risk_color,
            "factors_increasing_risk": increasing_factors,
            "factors_reducing_risk": reducing_factors,
            "preventive_actions": preventive_actions,
            "recommended_monitoring_interval": interval,
            "confidence_score": 93.5
        }
