from pydantic import BaseModel, Field


class GenerateIdeasRequest(BaseModel):
    vibe: str = Field(..., min_length=3, description="User's creative direction / mood")


class GenerateTitlesRequest(BaseModel):
    idea: dict = Field(..., description="Selected concept object from stage 1")


class GenerateMetadataRequest(BaseModel):
    idea: dict = Field(..., description="Selected concept object")
    title: str = Field(..., min_length=5, description="Chosen YouTube title")


class ThumbnailRequest(BaseModel):
    idea: dict
    title: str
    description: str
    tags: list[str] = Field(default_factory=list)


class SaveRepositoryRequest(BaseModel):
    video_idea: str = Field(..., alias="idea")
    title: str
    description: str
    tags: list[str] = Field(default_factory=list)
    thumbnail: str = Field(..., description="Thumbnail generation prompt")

    model_config = {"populate_by_name": True}
