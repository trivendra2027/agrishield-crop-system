from datetime import timezone
from pydantic import BaseModel
from typing import List, Optional

class StandardAPIMetadata(BaseModel):
    api_version: str = "1.0"
    generated_at: str
    processing_time_ms: float
    cache_status: str = "Live"
    cache_expires_in: Optional[int] = 1800

class TimelineEvent(BaseModel):
    id: str
    title: str
    description: str
    category: str
    timestamp: str
    severity: str

class FarmTimelineResponse(BaseModel):
    metadata: StandardAPIMetadata
    events: List[TimelineEvent]
    available_categories: List[str]
