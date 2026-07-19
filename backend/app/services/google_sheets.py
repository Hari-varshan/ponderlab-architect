from __future__ import annotations

import json
from typing import Any

import gspread
from google.oauth2.service_account import Credentials

from app.core.config import Settings, get_settings

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

# Expected column order in the repository sheet
COLUMNS = ["Video Idea", "Title", "Description", "Tags", "Thumbnail Idea/Description"]


class GoogleSheetsService:
    """Wrapper around gspread for the Ponder Lab Video Memory Repository."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._client: gspread.Client | None = None
        self._worksheet: gspread.Worksheet | None = None

    def _ensure_client(self) -> gspread.Worksheet:
        if self._worksheet is not None:
            return self._worksheet

        account_path = self._settings.service_account_path
        if not account_path.exists():
            raise FileNotFoundError(
                f"Google service account file not found at: {account_path}. "
                "Set GOOGLE_SERVICE_ACCOUNT_FILE in backend/.env"
            )
        if not self._settings.spreadsheet_id:
            raise ValueError(
                "SPREADSHEET_ID is not configured. Set it in backend/.env"
            )

        credentials = Credentials.from_service_account_file(
            str(account_path),
            scopes=SCOPES,
        )
        self._client = gspread.authorize(credentials)
        spreadsheet = self._client.open_by_key(self._settings.spreadsheet_id)
        self._worksheet = spreadsheet.worksheet(self._settings.worksheet_name)
        return self._worksheet

    def _normalize_records(self, records: list[dict[str, Any]]) -> list[dict[str, str]]:
        normalized: list[dict[str, str]] = []
        for row in records:
            normalized.append(
                {
                    "video_idea": str(row.get("Video Idea", "") or ""),
                    "title": str(row.get("Title", "") or ""),
                    "description": str(row.get("Description", "") or ""),
                    "tags": str(row.get("Tags", "") or ""),
                    "thumbnail": str(row.get("Thumbnail Idea/Description", "") or ""),
                }
            )
        return normalized

    def get_recent_history(self, limit: int | None = 10) -> list[dict[str, str]]:
        """Return repository rows; pass None to fetch full history."""
        ws = self._ensure_client()
        records = ws.get_all_records(expected_headers=COLUMNS)
        if limit is None:
            return self._normalize_records(records)
        if limit <= 0:
            return []
        tail = records[-limit:] if len(records) > limit else records
        return self._normalize_records(tail)

    def get_all_history(self) -> list[dict[str, str]]:
        """Return all historical rows for style/template knowledgebase usage."""
        return self.get_recent_history(limit=None)

    def append_new_video(self, data: dict[str, Any]) -> None:
        """Append a finalized video row to the sheet."""
        ws = self._ensure_client()
        tags_value = data.get("tags", "")
        if isinstance(tags_value, list):
            tags_value = ", ".join(tags_value)

        row = [
            data.get("video_idea") or data.get("idea", ""),
            data.get("title", ""),
            data.get("description", ""),
            tags_value,
            data.get("thumbnail", ""),
        ]
        ws.append_row(row, value_input_option="USER_ENTERED")

    @staticmethod
    def history_as_context(rows: list[dict[str, str]]) -> str:
        if not rows:
            return "No prior videos in repository."
        return json.dumps(rows, indent=2)

    @staticmethod
    def video_idea_knowledgebase(rows: list[dict[str, str]]) -> str:
        """Format repository Video Idea column entries for concept-stage style transfer."""
        if not rows:
            return "No prior Video Idea examples in repository."
        examples = [
            {"index": i + 1, "video_idea": row.get("video_idea", "")}
            for i, row in enumerate(rows)
            if row.get("video_idea", "").strip()
        ]
        return json.dumps(examples, indent=2, ensure_ascii=False)

    @staticmethod
    def title_knowledgebase(rows: list[dict[str, str]]) -> str:
        """Format repository Title column entries for title-stage style transfer."""
        if not rows:
            return "No prior Title examples in repository."
        examples = [
            {"index": i + 1, "title": row.get("title", "")}
            for i, row in enumerate(rows)
            if row.get("title", "").strip()
        ]
        return json.dumps(examples, indent=2, ensure_ascii=False)


def get_sheets_service() -> GoogleSheetsService:
    return GoogleSheetsService()
