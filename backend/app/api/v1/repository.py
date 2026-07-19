import logging

from fastapi import APIRouter, HTTPException

from app.schemas.request import SaveRepositoryRequest
from app.schemas.response import SaveRepositoryResponse
from app.services.google_sheets import get_sheets_service

router = APIRouter(prefix="/repository", tags=["repository"])
logger = logging.getLogger(__name__)


@router.post("/save", response_model=SaveRepositoryResponse)
def save_to_repository(body: SaveRepositoryRequest) -> SaveRepositoryResponse:
    try:
        sheets = get_sheets_service()
        sheets.append_new_video(
            {
                "video_idea": body.video_idea,
                "title": body.title,
                "description": body.description,
                "tags": body.tags,
                "thumbnail": body.thumbnail,
            }
        )
        return SaveRepositoryResponse()
    except HTTPException:
        raise
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unhandled error in /api/v1/repository/save")
        raise HTTPException(
            status_code=500,
            detail=f"{type(exc).__name__}: {exc}",
        ) from exc
