"""
Central application configuration.
Values are loaded from environment variables / .env file via pydantic-settings.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Marks Entry System - Attendance Module"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql://attendance_user:attendance_pass@localhost:5432/attendance_db"

    # JWT / Auth
    SECRET_KEY: str = "change-this-to-a-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance so the .env file is only parsed once."""
    return Settings()


settings = get_settings()
