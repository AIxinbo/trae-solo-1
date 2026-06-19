from pydantic import BaseModel
from typing import Optional


class CharacterCreate(BaseModel):
    name: str
    age: str = ""
    gender: str = ""
    role_type: str = "supporter"
    appearance: str = ""
    personality: str = ""
    background: str = ""
    motivation: str = ""
    speech_style: str = "普通"
    formality_level: float = 0.5
    avg_sentence_len: int = 8
    favorite_words: list[str] = []
    forbidden_words: list[str] = []
    tone_words: list[str] = []


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    role_type: Optional[str] = None
    appearance: Optional[str] = None
    personality: Optional[str] = None
    background: Optional[str] = None
    motivation: Optional[str] = None
    speech_style: Optional[str] = None
    formality_level: Optional[float] = None
    avg_sentence_len: Optional[int] = None
    favorite_words: Optional[list[str]] = None
    forbidden_words: Optional[list[str]] = None
    tone_words: Optional[list[str]] = None


class CharacterResponse(BaseModel):
    id: str
    book_id: str
    name: str
    age: str
    gender: str
    role_type: str
    appearance: str
    personality: str
    background: str
    motivation: str
    speech_style: str
    formality_level: float
    avg_sentence_len: int
    favorite_words: list[str]
    forbidden_words: list[str]
    tone_words: list[str]
    created_at: str

    model_config = {"from_attributes": True}