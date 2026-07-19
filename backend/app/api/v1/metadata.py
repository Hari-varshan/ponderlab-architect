import json
import logging
import re

from fastapi import APIRouter, HTTPException

from app.schemas.llm_output import MetadataLLMOutput, ThumbnailLLMOutput
from app.schemas.request import GenerateMetadataRequest, ThumbnailRequest
from app.schemas.response import GenerateMetadataResponse, ThumbnailResponse
from app.services.gemini import get_gemini_service
from app.services.google_sheets import get_sheets_service
from app.utils.prompt_loader import load_stage_prompt

router = APIRouter(prefix="/metadata", tags=["metadata"])
logger = logging.getLogger(__name__)


def _sanitize_description(text: str) -> str:
    """Enforce plain paragraphs: strip markdown dividers."""
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"^[-*_]{3,}\s*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _normalize_tags(tags: list) -> list[str]:
    cleaned = []
    for tag in tags:
        t = str(tag).strip().lstrip("#")
        if t:
            cleaned.append(t)
    return cleaned


@router.post("/generate", response_model=GenerateMetadataResponse)
def generate_metadata(body: GenerateMetadataRequest) -> GenerateMetadataResponse:
    try:
        sheets = get_sheets_service()
        history = sheets.get_all_history()
        history_context = sheets.history_as_context(history)
        gemini = get_gemini_service()
        user_prompt = (
            f"Selected concept:\n{json.dumps(body.idea, indent=2)}\n\n"
            f"Approved title: {body.title}\n\n"
            "Repository history descriptions for formatting style transfer:\n"
            f"{history_context}"
        )
        result = gemini.generate_structured(
            load_stage_prompt("metadata"),
            user_prompt,
            MetadataLLMOutput,
            temperature=0.7,
        )
        description = _sanitize_description(result.description)
        tags = _normalize_tags(result.tags)

        if len(tags) < 15:
            raise HTTPException(status_code=502, detail="Expected at least 15 tags")
        if len(tags) > 20:
            tags = tags[:20]

        return GenerateMetadataResponse(description=description, tags=tags)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unhandled error in /api/v1/metadata/generate")
        raise HTTPException(
            status_code=500,
            detail=f"{type(exc).__name__}: {exc}",
        ) from exc


@router.post("/thumbnail", response_model=ThumbnailResponse)
def generate_thumbnail(body: ThumbnailRequest) -> ThumbnailResponse:
    try:
        gemini = get_gemini_service()
        user_prompt = json.dumps(
            {
                "idea": body.idea,
                "title": body.title,
                "description": body.description,
                "tags": body.tags,
            },
            indent=2,
        )
        result = gemini.generate_structured(
            load_stage_prompt("thumbnail"),
            user_prompt,
            ThumbnailLLMOutput,
            temperature=0.8,
        )
        prompt_text = result.thumbnail_prompt.strip()
        if not prompt_text:
            raise HTTPException(status_code=502, detail="Empty thumbnail prompt")
        return ThumbnailResponse(thumbnail_prompt=prompt_text)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unhandled error in /api/v1/metadata/thumbnail")
        raise HTTPException(
            status_code=500,
            detail=f"{type(exc).__name__}: {exc}",
        ) from exc
