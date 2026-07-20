import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GOOGLE_AI_API_KEY: str = os.getenv("GOOGLE_AI_API_KEY", "")

    class Config:
        env_file = ".env"

settings = Settings()
