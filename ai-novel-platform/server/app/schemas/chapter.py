from pydantic import BaseModel
from typing import Optional


class ChapterCreate(BaseModel):
    title: str
    outline_id: Optional[str] = None
    word_count_target: int = 2000
    sort_order: int = 0


class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    word_count: Optional[int] = None
    word_count_target: Optional[int] = None
    characters: Optional[list[str]] = None
    status: Optional[str] = None
    ai_summary: Optional[str] = None


class ChapterResponse(BaseModel):
    id: str
    book_id: str
    outline_id: Optional[str]
    title: str
    content: str
    word_count: int
    word_count_target: int
    characters: list[str]
    status: str
    sort_order: int
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}