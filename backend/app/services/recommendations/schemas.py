from datetime import timezone
from pydantic import BaseModel
from typing import List, Optional

class StandardAPIMetadata(BaseModel):
    api_version: str = "1.0"
    generated_at: str
    processing_time_ms: float
    cache_status: str = "Live"
    cache_expires_in: Optional[int] = 1800

class RecommendationItem(BaseModel):
    id: str
    recommendation: str
    confidence: float
    reasoning: List[str]
    priority: str
    category: str
    generated_at: str

class DailyRecommendationsResponse(BaseModel):
    metadata: StandardAPIMetadata
    recommendations: List[RecommendationItem]
