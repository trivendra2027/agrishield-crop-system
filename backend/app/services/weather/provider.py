import logging
import httpx
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Tuple
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class BaseWeatherProvider(ABC):
    @abstractmethod
    async def fetch_weather(self, lat: float, lon: float) -> Tuple[Dict[str, Any], str, str]:
        """Fetch weather payload. Returns (data, provider_name, provider_status)."""
        pass

class MockWeatherProvider(BaseWeatherProvider):
    async def fetch_weather(self, lat: float, lon: float) -> Tuple[Dict[str, Any], str, str]:
        if lat is None:
            lat = 16.5062
        if lon is None:
            lon = 80.6480
        lat = float(lat)
        lon = float(lon)

        logger.info(f"Generating mock weather payload for lat: {lat}, lon: {lon}")
        now = datetime.now(timezone.utc)
        current_hour = now.hour
        
        lat_offset = max(0.0, (30.0 - abs(lat)) * 0.4)
        base_temp = 24.0 + lat_offset - abs(current_hour - 14) * 0.4
        
        current_weather = {
            "temperature": round(base_temp, 1),
            "humidity": 68 + (current_hour % 4),
            "wind_speed": 4.5,
            "pressure": 1012.5,
            "condition": "Rain" if current_hour % 4 == 0 else "Clear",
            "description": "light intensity shower" if current_hour % 4 == 0 else "scattered clouds",
            "rain_probability": 75 if current_hour % 4 == 0 else 20,
            "rain_amount": 3.2 if current_hour % 4 == 0 else 0.0,
            "uv_index": round(6.5 if 9 <= current_hour <= 15 else 1.2, 1),
            "sunrise": (now.replace(hour=6, minute=10, second=0)).isoformat() + "Z",
            "sunset": (now.replace(hour=18, minute=45, second=0)).isoformat() + "Z"
        }

        hourly_forecast = []
        for i in range(8):
            f_time = now + timedelta(hours=(i + 1) * 3)
            f_temp = base_temp - abs(f_time.hour - 14) * 0.4
            rain_prob = 80 if i in [1, 2] else (25 if i in [0, 3] else 10)
            hourly_forecast.append({
                "time": f_time.isoformat() + "Z",
                "temperature": round(f_temp, 1),
                "condition": "Rain" if rain_prob > 50 else "Clouds",
                "description": "moderate rain" if rain_prob > 50 else "partly cloudy",
                "rain_probability": rain_prob,
                "rain_amount": 4.5 if rain_prob > 50 else 0.0
            })

        daily_forecast = []
        for d in range(7):
            d_date = (now + timedelta(days=d)).strftime("%Y-%m-%d")
            daily_forecast.append({
                "date": d_date,
                "temp_max": round(base_temp + 3.0 - (d % 2), 1),
                "temp_min": round(base_temp - 6.0 + (d % 2), 1),
                "condition": "Rain" if d in [1, 4] else "Sunny",
                "description": "light rain showers" if d in [1, 4] else "mostly sunny",
                "rain_probability": 85 if d in [1, 4] else 15,
                "rain_amount": 8.0 if d in [1, 4] else 0.0,
                "uv_max": 7.5
            })

        recommendations = [
            "Optimal temperature window for foliar nutrient sprays.",
            "High humidity expected: monitor for fungal spore development."
        ]
        if current_weather["rain_probability"] > 50:
            recommendations.append("Delay pesticide spray due to high rain probability in next 6 hours.")

        payload = {
            "current": current_weather,
            "hourly_forecast": hourly_forecast,
            "daily_forecast": daily_forecast,
            "recommendations": recommendations,
            "location_name": f"Farm Sector ({lat:.2f}°N, {lon:.2f}°E)"
        }
        return payload, "MockWeatherProvider", "Online (Fallback Mock)"

class OpenWeatherMapProvider(BaseWeatherProvider):
    async def fetch_weather(self, lat: float, lon: float) -> Tuple[Dict[str, Any], str, str]:
        api_key = getattr(settings, "OPENWEATHER_API_KEY", "")
        if not api_key or api_key == "YOUR_OPENWEATHERMAP_API_KEY":
            logger.info("OpenWeatherMap API key missing. Falling back to MockWeatherProvider.")
            return await MockWeatherProvider().fetch_weather(lat, lon)

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                url = "https://api.openweathermap.org/data/2.5/forecast"
                params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric"}
                response = await client.get(url, params=params)
                if response.status_code != 200:
                    logger.warning(f"OpenWeatherMap returned status {response.status_code}. Fallback to mock.")
                    return await MockWeatherProvider().fetch_weather(lat, lon)
                
                data = response.json()
                city = data.get("city", {}).get("name", "Farm Location")
                first = data.get("list", [{}])[0]
                main = first.get("main", {})
                weather_item = first.get("weather", [{}])[0]

                current = {
                    "temperature": main.get("temp", 25.0),
                    "humidity": main.get("humidity", 60),
                    "wind_speed": first.get("wind", {}).get("speed", 3.5),
                    "pressure": main.get("pressure", 1012),
                    "condition": weather_item.get("main", "Clear"),
                    "description": weather_item.get("description", "clear sky"),
                    "rain_probability": round(first.get("pop", 0) * 100, 1),
                    "rain_amount": first.get("rain", {}).get("3h", 0.0),
                    "uv_index": 5.0,
                    "sunrise": datetime.now(timezone.utc).replace(hour=6).isoformat() + "Z",
                    "sunset": datetime.now(timezone.utc).replace(hour=18).isoformat() + "Z"
                }

                hourly = []
                for item in data.get("list", [])[:8]:
                    hourly.append({
                        "time": item.get("dt_txt", datetime.now(timezone.utc).isoformat()),
                        "temperature": item.get("main", {}).get("temp", 25.0),
                        "condition": item.get("weather", [{}])[0].get("main", "Clear"),
                        "description": item.get("weather", [{}])[0].get("description", "clear sky"),
                        "rain_probability": round(item.get("pop", 0) * 100, 1),
                        "rain_amount": item.get("rain", {}).get("3h", 0.0)
                    })

                daily = []
                for d in range(7):
                    daily.append({
                        "date": (datetime.now(timezone.utc) + timedelta(days=d)).strftime("%Y-%m-%d"),
                        "temp_max": current["temperature"] + 2.0,
                        "temp_min": current["temperature"] - 4.0,
                        "condition": current["condition"],
                        "description": current["description"],
                        "rain_probability": current["rain_probability"],
                        "rain_amount": current["rain_amount"],
                        "uv_max": 6.5
                    })

                payload = {
                    "current": current,
                    "hourly_forecast": hourly,
                    "daily_forecast": daily,
                    "recommendations": ["OpenWeatherMap live telemetry active."],
                    "location_name": city
                }
                return payload, "OpenWeatherMapProvider", "Online"
        except Exception as e:
            logger.error(f"OpenWeatherMap request failed: {e}. Falling back to mock.")
            return await MockWeatherProvider().fetch_weather(lat, lon)

class TomorrowIoProvider(BaseWeatherProvider):
    async def fetch_weather(self, lat: float, lon: float) -> Tuple[Dict[str, Any], str, str]:
        # Stub for future provider
        logger.info("TomorrowIoProvider invoked, delegating to MockWeatherProvider.")
        return await MockWeatherProvider().fetch_weather(lat, lon)
