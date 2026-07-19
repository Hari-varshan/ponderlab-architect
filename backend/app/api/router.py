from fastapi import APIRouter

from app.api.v1 import ideas, metadata, repository, titles

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(ideas.router)
api_router.include_router(titles.router)
api_router.include_router(metadata.router)
api_router.include_router(repository.router)
