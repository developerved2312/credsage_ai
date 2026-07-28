from pydantic_settings import BaseSettings
from typing import Literal
import os

class Settings(BaseSettings):
    # Service Configuration
    PORT: int = 8000
    ENVIRONMENT: Literal["development", "production", "test"] = "development"
    LOG_LEVEL: str = "INFO"
    
    # Model Configuration
    MODEL_PATH: str = "./models"
    MODEL_TYPE: Literal["catboost", "xgboost", "ensemble"] = "catboost"
    MODEL_VERSION: str = "1.0.0"

    # LLM Configuration
    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
