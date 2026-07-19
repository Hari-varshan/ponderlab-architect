from pydantic import BaseModel, Field

from app.schemas.llm_output import ConceptItem, TitleItem


class GenerateIdeasResponse(BaseModel):
    concepts: list[ConceptItem] = Field(..., min_length=3, max_length=3)
    history_count: int = 0


class GenerateTitlesResponse(BaseModel):
    titles: list[TitleItem] = Field(..., min_length=5, max_length=6)


class GenerateMetadataResponse(BaseModel):
    description: str
    tags: list[str] = Field(..., min_length=15, max_length=20)


class ThumbnailResponse(BaseModel):
    thumbnail_prompt: str


class SaveRepositoryResponse(BaseModel):
    success: bool = True
    message: str = "Row appended to repository"


class HistoryRow(BaseModel):
    video_idea: str = ""
    title: str = ""
    description: str = ""
    tags: str = ""
    thumbnail: str = ""
