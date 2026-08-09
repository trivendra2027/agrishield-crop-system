from datetime import timezone
from pydantic import BaseModel
from typing import List, Optional

class StandardAPIMetadata(BaseModel):
    api_version: str = "1.0"
    generated_at: str
    processing_time_ms: float
    cache_status: str = "Live"
    cache_expires_in: Optional[int] = 1800

class IrrigationRecommendationResponse(BaseModel):
    metadata: StandardAPIMetadata
    irrigation_required: bool
    water_quantity_liters_per_acre: float
    water_quantity_total: float
    best_irrigation_time: str
    next_irrigation_date: str
    confidence_score: float
    recommendation: str
    reasoning: List[str]
    crop_type: str
    growth_stage: str
    current_soil_moisture: float
    target_soil_moisture: float
