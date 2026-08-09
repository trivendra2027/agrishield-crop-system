from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class FirmwareReleaseCreate(BaseModel):
    version: str = Field(..., description="Semantic version string, e.g., v2.1.0 or 2.1.0")
    hardware_model: str = Field("ESP32 DevKit V1", description="Target hardware model or '*' for all compatible devices")
    release_notes: Optional[str] = Field("", description="Description of changes and new features in this firmware release")
    is_active: bool = Field(True, description="Whether this release is active and available for OTA deployment")

class FirmwareMetadata(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    version: str
    filename: str
    sha256: str
    size_bytes: int
    hardware_model: str
    release_notes: str
    is_active: bool
    uploaded_at: datetime
    uploaded_by: str
    file_path: str

class FirmwareUploadResponse(BaseModel):
    status: str = "success"
    message: str
    firmware: FirmwareMetadata

class FirmwareListResponse(BaseModel):
    total: int
    releases: List[FirmwareMetadata]

class OtaCheckResponse(BaseModel):
    update_available: bool
    latest_version: str
    download_url: str
    sha256: str
    size_bytes: int
    release_notes: str
    hardware_model: str

class OtaAuditLogEntry(BaseModel):
    action: str
    timestamp: datetime
    actor: str
    details: Dict[str, Any]
