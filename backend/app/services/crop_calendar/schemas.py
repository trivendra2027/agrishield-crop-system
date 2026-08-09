from datetime import timezone
from pydantic import BaseModel
from typing import List, Optional

class StandardAPIMetadata(BaseModel):
    api_version: str = "1.0"
    generated_at: str
    processing_time_ms: float
    cache_status: str = "Live"
    cache_expires_in: Optional[int] = 1800

class StageDetail(BaseModel):
    stage_name: str
    duration_days: int
    is_active: bool
    activities: List[str]
    fertilizer_schedule: List[str]
    irrigation_schedule: str
    pest_monitoring: List[str]
    disease_monitoring: List[str]

class CropCalendarResponse(BaseModel):
    metadata: StandardAPIMetadata
    crop_name: str
    current_stage: str
    days_since_sowing: int
    total_lifecycle_days: int
    stages: List[StageDetail]
