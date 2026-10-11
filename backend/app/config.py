
from pydantic_settings import BaseSettings, SettingsConfigDict


import os

class Settings(BaseSettings):
    app_name: str = "AtmosAI Backend"
    environment: str = "development"

    aws_region: str = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION") or "us-east-1"

    dynamodb_telemetry_table: str = "AtmosAI-Telemetry"
    dynamodb_forecast_table: str = "AtmosAI-Forecasts"
    dynamodb_alerts_table: str = "AtmosAI-Alerts"

    use_dynamodb: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()