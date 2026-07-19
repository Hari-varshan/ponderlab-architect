import logging

from fastapi import APIRouter, HTTPException

from app.schemas.llm_output import IdeasLLMOutput
from app.schemas.request import GenerateIdeasRequest
from app.schemas.response import GenerateIdeasResponse
from app.services.gemini import get_gemini_service
from app.services.google_sheets import get_sheets_service
from app.utils.prompt_loader import load_stage_prompt

router = APIRouter(prefix="/ideas", tags=["ideas"])
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=GenerateIdeasResponse)
def generate_ideas(body: GenerateIdeasRequest) -> GenerateIdeasResponse:
    try:
        sheets = get_sheets_service()
        history = sheets.get_all_history()
        idea_kb = sheets.video_idea_knowledgebase(history)

        gemini = get_gemini_service()
        user_prompt = (
            f"Vibe request: {body.vibe}\n\n"
            "Repository Video Idea examples (match this prose style; do not repeat these mixes):\n"
            f"{idea_kb}"
        )
        result = gemini.generate_structured(
            load_stage_prompt("ideas"),
            user_prompt,
            IdeasLLMOutput,
        )
        return GenerateIdeasResponse(
            concepts=result.concepts,
            history_count=len(history),
        )
    except HTTPException:
        raise
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unhandled error in /api/v1/ideas/generate")
        raise HTTPException(
            status_code=500,
            detail=f"{type(exc).__name__}: {exc}",
        ) from exc
