from datetime import timezone
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class StandardAPIMetadata(BaseModel):
    api_version: str = "1.0"
    generated_at: str
    processing_time_ms: float
    cache_status: str = "Live"
    cache_expires_in: Optional[int] = 1800

class CurrentWeather(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    pressure: float
    condition: str
    description: str
    rain_probability: float
    rain_amount: float
    uv_index: float
    sunrise: str
    sunset: str

class ForecastPoint(BaseModel):
    time: str
    temperature: float
    condition: str
    description: str
    rain_probability: float
    rain_amount: float

class DailyForecastPoint(BaseModel):
    date: str
    temp_max: float
    temp_min: float
    condition: str
    description: str
    rain_probability: float
    rain_amount: float
    uv_max: float

class WeatherResponse(BaseModel):
    metadata: StandardAPIMetadata
    provider_name: str
    provider_status: str
    last_successful_sync: str
    location: str
    latitude: float
    longitude: float
    current: CurrentWeather
    hourly_forecast: List[ForecastPoint]
    daily_forecast: List[DailyForecastPoint]
    recommendations: List[str]
