from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    google_service_account_file: str = "./service-account.json"
    spreadsheet_id: str = ""
    worksheet_name: str = "Ponder Lab Video Memory Repository"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def service_account_path(self) -> Path:
        path = Path(self.google_service_account_file)
        if not path.is_absolute():
            path = _BACKEND_ROOT / path
        return path


@lru_cache
def get_settings() -> Settings:
    return Settings()
