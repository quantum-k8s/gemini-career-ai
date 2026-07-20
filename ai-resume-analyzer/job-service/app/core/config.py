import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@postgres:5432/resumedb")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "jwtsecretforauthservice9988")

    class Config:
        env_file = ".env"

settings = Settings()
