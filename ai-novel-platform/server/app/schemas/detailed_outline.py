from pydantic import BaseModel
from typing import Optional


class DetailedOutlineCreate(BaseModel):
    chapter_id: str
    title: str
    function: str = ""
    emotion: str = ""
    word_count_target: int = 0
    characters: list[str] = []
    location: str = ""
    day_number: int = 0
    description: str = ""
    key_dialogues: str = ""
    pleasure_types: list[str] = []


class DetailedOutlineUpdate(BaseModel):
    title: Optional[str] = None
    function: Optional[str] = None
    emotion: Optional[str] = None
    word_count_target: Optional[int] = None
    characters: Optional[list[str]] = None
    location: Optional[str] = None
    day_number: Optional[int] = None
    description: Optional[str] = None
    key_dialogues: Optional[str] = None
    pleasure_types: Optional[list[str]] = None
    status: Optional[str] = None
    scene_index: Optional[int] = None


class DetailedOutlineResponse(BaseModel):
    id: str
    book_id: str
    chapter_id: str
    scene_index: int
    title: str
    function: str
    emotion: str
    word_count_target: int
    characters: list[str]
    location: str
    day_number: int
    description: str
    key_dialogues: str
    pleasure_types: list[str]
    status: str
    created_at: str

    model_config = {"from_attributes": True}