from pydantic_settings import BaseSettings
from typing import Optional
import secrets


class Settings(BaseSettings):
    """Application settings using Pydantic"""
    
    # Application
    APP_NAME: str = "InfraVoice"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Google AI
    GOOGLE_API_KEY: Optional[str] = None
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    # External Tools
    TERRAFORM_PATH: str = "/usr/local/bin/terraform"
    CHECKOV_PATH: str = "checkov"
    INFRACOST_PATH: str = "infracost"
    
    # API Configuration
    DEFAULT_API_QUOTA: int = 100
    MAX_FILE_SIZE: int = 25 * 1024 * 1024  # 25MB
    
    # Whisper Model
    WHISPER_MODEL_SIZE: str = "base"  # tiny, base, small, medium, large
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables


# Validate settings on import
settings = Settings()

# Fail fast if required settings are missing
required_settings = ['DATABASE_URL', 'SECRET_KEY', 'REDIS_URL']
missing_settings = []

for setting in required_settings:
    if not getattr(settings, setting, None):
        missing_settings.append(setting)

if missing_settings:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_settings)}")
