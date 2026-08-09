from datetime import timezone
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class IrrigationRecommendationEngine:
    @staticmethod
    def generate_recommendation(
        soil_moisture: float,
        rain_sensor: int,
        temperature: float,
        humidity: float,
        light_intensity: float,
        forecast_list: List[Dict[str, Any]],
        crop_name: Optional[str] = None,
        growth_stage: Optional[str] = None,
        irrigation_method: Optional[str] = None,
        water_source: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluate real-time sensor inputs and weather forecasts to generate smart, personalized irrigation advice.
        """
        logger.info(f"Evaluating irrigation rules. Soil: {soil_moisture}%, Rain Sensor: {rain_sensor}, Crop: {crop_name}")
        
        # 1. Analyze weather forecast for the next 12 hours (first 4 forecast points, 3h apart)
        max_rain_probability = 0
        total_forecasted_rain = 0.0
        
        for item in forecast_list[:4]: # Next 12 hours
            prob = item.get("rain_probability", 0)
            amount = item.get("rain_amount", 0.0)
            if prob > max_rain_probability:
                max_rain_probability = prob
            total_forecasted_rain += amount
            
        total_forecasted_rain = round(total_forecasted_rain, 1)

        # Contextual prefix helpers
        crop_desc = f"your {crop_name}" if crop_name else "your crops"
        stage_desc = f" ({growth_stage} stage)" if (crop_name and growth_stage) else ""
        method_desc = f" active {irrigation_method.lower()}" if irrigation_method else " active"
        source_desc = f" (using water from {water_source.lower()})" if water_source else ""

        # Rule 1: Active rain detected on the farm
        if rain_sensor == 1:
            return {
                "recommendation": "Stop Irrigation",
                "reason": f"Active rainfall detected on your farm sensors. Stop all{method_desc} watering systems immediately to prevent root flooding of {crop_desc}{stage_desc}.",
                "priority": "Critical",
                "recommended_water": "0 L/m²"
            }
            
        # Rule 2: Soil is saturated/wet
        if soil_moisture >= 70.0:
            return {
                "recommendation": "No Irrigation Needed",
                "reason": f"Soil moisture is optimal at {soil_moisture}% for {crop_desc}{stage_desc}. Saturated roots can lead to oxygen deprivation and fungal infections.",
                "priority": "Low",
                "recommended_water": "0 L/m²"
            }
            
        # Rule 3: Heavy rain forecasted
        if max_rain_probability >= 60 or total_forecasted_rain >= 2.0:
            if soil_moisture > 30.0:
                return {
                    "recommendation": "Delay Irrigation",
                    "reason": f"Soil moisture is moderate ({soil_moisture}%) and heavy rainfall is expected in the next 12 hours ({total_forecasted_rain}mm, {max_rain_probability}% chance). Let natural rain irrigate {crop_desc}{stage_desc}.",
                    "priority": "Medium",
                    "recommended_water": "0 L/m²"
                }
            else:
                # Soil is critically dry but rain is coming
                return {
                    "recommendation": "Irrigate (Light)",
                    "reason": f"Soil is critically dry ({soil_moisture}%) for {crop_desc}{stage_desc} but heavy rain is expected in 6-12 hours. Apply a light watering cycle (1.5 L/m²) to protect crop roots until rain begins.",
                    "priority": "Medium",
                    "recommended_water": "1.5 L/m²"
                }
                
        # Rule 4: Soil is dry & no rain forecasted
        if soil_moisture < 35.0:
            # Determine priority based on extreme heat/light
            priority = "High" if (temperature > 32.0 or light_intensity > 20000) else "Medium"
            water_amount = "5.0 L/m²" if temperature > 32.0 else "3.5 L/m²"
            
            # Refine recommended amount based on irrigation method efficiency
            if irrigation_method and irrigation_method.lower() == "drip":
                water_amount = "3.5 L/m²" if temperature > 32.0 else "2.0 L/m²"
            
            heat_info = " combined with high atmospheric heat" if temperature > 32.0 else ""
            return {
                "recommendation": "Irrigate Now",
                "reason": f"Soil moisture is critically dry at {soil_moisture}% for {crop_desc}{stage_desc} and the weather forecast shows clear skies{heat_info}. Water your crops immediately via {irrigation_method.lower() if irrigation_method else 'irrigation'}{source_desc} to prevent wilting.",
                "priority": priority,
                "recommended_water": water_amount
            }
            
        # Rule 5: Normal healthy soil moisture, clear forecast
        return {
            "recommendation": "No Action Required",
            "reason": f"Soil moisture is at a healthy level ({soil_moisture}%) for {crop_desc}{stage_desc} and the immediate 24-hour weather forecast is clear. Monitor sensors regularly.",
            "priority": "Low",
            "recommended_water": "0 L/m²"
        }

recommendation_engine = IrrigationRecommendationEngine()
