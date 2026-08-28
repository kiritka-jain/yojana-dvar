import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application settings loaded from environment variables or defaults."""
    
    APP_NAME: str = "Yojana Dvar API"
    VERSION: str = "1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # GCP / BigQuery Config
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "yojana-dvar-dev")
    BIGQUERY_DATASET: str = os.getenv("BIGQUERY_DATASET", "yojana_dvar")
    SCHEMES_TABLE: str = os.getenv("SCHEMES_TABLE", "schemes_women")
    
    # Gemini AI Config
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS Config
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://yojana-dvar.web.app",
        "https://yojana-dvar.firebaseapp.com",
    ]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
