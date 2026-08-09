from datetime import timezone
import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENV: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True

    from pydantic import Field
    # Security
    JWT_SECRET_KEY: str = Field(..., min_length=32, description="Must be set in .env")
    REFRESH_TOKEN_SECRET_KEY: str = Field(..., min_length=32, description="Must be set in .env")
    JWT_ALGORITHM: str = "HS256"
    JWT_ISSUER: str = "crop_disease_detection_api"
    JWT_AUDIENCE: str = "crop_disease_detection_app"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120  # 2 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7      # 7 days
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15

    # IoT Security
    IOT_API_KEY: str = "crop_iot_secure_key_2026"
    IOT_SECURITY_MODE: str = "development"  # "development" (permissive) or "production" (enforced)

    # File Upload & API Limits
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"

    # Database
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "crop_disease_db"

    # NVIDIA NIM API Settings
    NVIDIA_API_KEY: str = ""
    NVIDIA_API_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_MODEL_NAME: str = "meta/llama-3.1-8b-instruct"
    OPENWEATHER_API_KEY: str = ""

    # Static/Upload folders
    UPLOAD_DIR: str = "uploads"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
