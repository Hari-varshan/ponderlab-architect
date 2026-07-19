import json
import logging

from fastapi import APIRouter, HTTPException

from app.schemas.llm_output import TitlesLLMOutput
from app.schemas.request import GenerateTitlesRequest
from app.schemas.response import GenerateTitlesResponse
from app.services.gemini import get_gemini_service
from app.services.google_sheets import get_sheets_service
from app.utils.prompt_loader import load_stage_prompt

router = APIRouter(prefix="/titles", tags=["titles"])
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=GenerateTitlesResponse)
def generate_titles(body: GenerateTitlesRequest) -> GenerateTitlesResponse:
    try:
        sheets = get_sheets_service()
        history = sheets.get_all_history()
        title_kb = sheets.title_knowledgebase(history)

        gemini = get_gemini_service()
        user_prompt = (
            f"Selected video idea (from concept stage):\n{json.dumps(body.idea, indent=2)}\n\n"
            "Repository Title examples (match this bracketed pipe-separated style):\n"
            f"{title_kb}"
        )
        result = gemini.generate_structured(
            load_stage_prompt("titles"),
            user_prompt,
            TitlesLLMOutput,
            temperature=0.85,
        )
        return GenerateTitlesResponse(titles=result.titles)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unhandled error in /api/v1/titles/generate")
        raise HTTPException(
            status_code=500,
            detail=f"{type(exc).__name__}: {exc}",
        ) from exc
