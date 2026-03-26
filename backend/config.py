from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache
import os
from pathlib import Path

class Settings(BaseSettings):
    groq_api_key: str = Field(..., env="GROQ_API_KEY")
    github_token: str = Field(..., env="GITHUB_TOKEN")
    github_gist_id: str = Field("", env="GITHUB_GIST_ID")
    app_env: str = Field("development", env="APP_ENV")
    cors_origins: str = Field("http://localhost:5173", env="CORS_ORIGINS")
    secret_key: str = Field("change-me", env="SECRET_KEY")

    groq_base_url: str = "https://api.groq.com/openai/v1"
    github_api_url: str = "https://api.github.com"

    model_smart: str = "llama-3.3-70b-versatile"
    model_fast: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    model_stt: str = "whisper-large-v3"
    model_fallback: str = "moonshotai/kimi-k2-instruct"

    env_file: str = ".env"

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        from dotenv import load_dotenv
        load_dotenv(env_path)
    return Settings()


settings = get_settings()
