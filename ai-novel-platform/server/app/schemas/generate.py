from pydantic import BaseModel
from typing import Optional


class GenerateChapterRequest(BaseModel):
    chapter_id: str
    target_words: int = 2000


class GenerateOutlineRequest(BaseModel):
    pass


class GenerateCharactersRequest(BaseModel):
    pass


class GenerateResponse(BaseModel):
    success: bool
    message: str = ""
    data: Optional[dict] = None