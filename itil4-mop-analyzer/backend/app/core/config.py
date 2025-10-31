from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings and configuration."""
    
    # Application
    APP_NAME: str = "ITIL4 MOP Analyzer"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API Keys
    OPENAI_API_KEY: str
    TAVILY_API_KEY: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Upload
    MAX_FILE_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx", ".doc"]
    UPLOAD_DIR: str = "./uploads"
    REPORTS_DIR: str = "./reports"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./database/mop_analyzer.db"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
