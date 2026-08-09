from datetime import timezone
from pydantic import BaseModel
from typing import List, Optional

class StandardAPIMetadata(BaseModel):
    api_version: str = "1.0"
    generated_at: str
    processing_time_ms: float
    cache_status: str = "Live"
    cache_expires_in: Optional[int] = 1800

class HealthScoreBreakdown(BaseModel):
    disease_history_contribution: float
    weather_contribution: float
    irrigation_contribution: float
    crop_growth_contribution: float
    recovery_contribution: float
    ai_confidence_contribution: float

class FarmHealthScoreResponse(BaseModel):
    metadata: StandardAPIMetadata
    overall_score: int
    previous_score: int
    trend: str
    breakdown: HealthScoreBreakdown
    improvement_suggestions: List[str]
