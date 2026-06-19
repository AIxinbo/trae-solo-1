from pydantic import BaseModel
from typing import Optional


class BookCreate(BaseModel):
    title: str
    genre: str = "玄幻"
    style: str = "default"
    synopsis: str = ""
    target_platform: str = ""
    world_setting: str = ""
    word_count_target: int = 0
    ai_config: dict = {}


class BookUpdate(BaseModel):
    title: Optional[str] = None
    genre: Optional[str] = None
    style: Optional[str] = None
    synopsis: Optional[str] = None
    target_platform: Optional[str] = None
    world_setting: Optional[str] = None
    word_count_target: Optional[int] = None
    status: Optional[str] = None
    ai_config: Optional[dict] = None


class BookResponse(BaseModel):
    id: str
    user_id: str
    title: str
    genre: str
    style: str
    synopsis: str
    target_platform: str
    world_setting: str
    word_count_target: int
    status: str
    ai_config: dict
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}