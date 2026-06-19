from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TimelineEventCreate(BaseModel):
    chapter_id: Optional[str] = None
    day_number: int
    event_desc: str
    involved_chars: list[str] = []
    location: str = ""
    season: str = ""
    importance: int = 5


class TimelineEventUpdate(BaseModel):
    day_number: Optional[int] = None
    event_desc: Optional[str] = None
    involved_chars: Optional[list[str]] = None
    location: Optional[str] = None
    season: Optional[str] = None
    importance: Optional[int] = None


class TimelineEventResponse(BaseModel):
    id: str
    book_id: str
    chapter_id: Optional[str]
    day_number: int
    event_desc: str
    involved_chars: list[str]
    location: str
    season: str
    importance: int
    created_at: datetime

    model_config = {"from_attributes": True}


class CharStateLogCreate(BaseModel):
    character_id: str
    chapter_id: Optional[str] = None
    chapter_number: int
    state_snapshot: dict


class CharStateLogResponse(BaseModel):
    id: str
    character_id: str
    chapter_id: Optional[str]
    chapter_number: int
    state_snapshot: dict
    created_at: datetime

    model_config = {"from_attributes": True}