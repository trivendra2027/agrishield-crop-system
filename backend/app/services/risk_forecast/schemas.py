from datetime import timezone
from pydantic import BaseModel
from typing import List, Optional

class StandardAPIMetadata(BaseModel):
    api_version: str = "1.0"
    generated_at: str
    processing_time_ms: float
    cache_status: str = "Live"
    cache_expires_in: Optional[int] = 1800

class DiseaseRiskResponse(BaseModel):
    metadata: StandardAPIMetadata
    crop_name: str
    disease_target: str
    risk_percentage: float
    risk_level: str
    risk_color: str
    factors_increasing_risk: List[str]
    factors_reducing_risk: List[str]
    preventive_actions: List[str]
    recommended_monitoring_interval: str
    confidence_score: float
