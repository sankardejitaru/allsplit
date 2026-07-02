from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Bill Split App"
    environment: str = "development"
    debug: bool = False

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "allsplit_db"

    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    require_jwt_auth: bool = False
    enable_debug_routes: bool = False
    otp_test_mode: bool = True
    otp_test_value: str = "123456"
    otp_expire_minutes: int = 5

    enable_sms: bool = False
    enable_whatsapp: bool = False
    enable_push_notifications: bool = False

    cors_origins: str = "*"

    google_vision_credentials_path: str = "credentials/google_vision_key.json"

    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "ap-south-1"

    deepseek_api_key: str = ""

    @property
    def cors_origin_list(self) -> List[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
