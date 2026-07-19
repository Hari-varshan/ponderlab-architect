"""Pydantic schemas used as Gemini structured-output response schemas."""

from typing import Literal

from pydantic import BaseModel, Field


class ConceptItem(BaseModel):
    id: str
    concept_name: str
    video_idea: str
    noise_stack: str
    duration_hours: float
    use_case: Literal["sleep", "focus", "adhd"]
    audience_benefit_reasoning: str
    differentiator: str


class IdeasLLMOutput(BaseModel):
    concepts: list[ConceptItem] = Field(min_length=3, max_length=3)


class TitleItem(BaseModel):
    id: str
    text: str


class TitlesLLMOutput(BaseModel):
    titles: list[TitleItem] = Field(min_length=5, max_length=6)


class MetadataLLMOutput(BaseModel):
    description: str
    tags: list[str] = Field(min_length=15, max_length=20)


class ThumbnailLLMOutput(BaseModel):
    thumbnail_prompt: str
