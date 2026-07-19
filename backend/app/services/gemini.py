from __future__ import annotations

from typing import TypeVar

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.core.config import Settings, get_settings

T = TypeVar("T", bound=BaseModel)


class GeminiService:
    """Wrapper for Google Gemini structured generation via google.genai."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        if not self._settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not configured in backend/.env")
        self._client = genai.Client(api_key=self._settings.gemini_api_key)

    def _generate_response(
        self,
        system_instruction: str,
        user_prompt: str,
        response_schema: type[T],
        *,
        temperature: float,
    ):
        return self._client.models.generate_content(
            model=self._settings.gemini_model,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=temperature,
                response_mime_type="application/json",
                response_schema=response_schema,
            ),
        )

    @staticmethod
    def _parse_response(response, response_schema: type[T]) -> T:
        parsed = response.parsed
        if parsed is None:
            text = (response.text or "").strip()
            raise ValueError(
                f"Gemini returned no structured output. Raw response: {text[:500]}"
            )
        if not isinstance(parsed, response_schema):
            raise ValueError(
                f"Gemini parsed type mismatch: expected {response_schema.__name__}, "
                f"got {type(parsed).__name__}"
            )
        return parsed

    def generate_structured(
        self,
        system_instruction: str,
        user_prompt: str,
        response_schema: type[T],
        *,
        temperature: float = 0.9,
    ) -> T:
        """Send system + user content and return a validated Pydantic model."""
        response = self._generate_response(
            system_instruction,
            user_prompt,
            response_schema,
            temperature=temperature,
        )
        return self._parse_response(response, response_schema)

    def generate_structured_debug(
        self,
        system_instruction: str,
        user_prompt: str,
        response_schema: type[T],
        *,
        temperature: float = 0.9,
    ) -> tuple[T, str]:
        """Like generate_structured, but also returns the raw JSON text from Gemini."""
        response = self._generate_response(
            system_instruction,
            user_prompt,
            response_schema,
            temperature=temperature,
        )
        parsed = self._parse_response(response, response_schema)
        return parsed, (response.text or "")


def get_gemini_service() -> GeminiService:
    return GeminiService()
