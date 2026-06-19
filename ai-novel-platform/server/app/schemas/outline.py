from pydantic import BaseModel
from typing import Optional


class OutlineCreate(BaseModel):
    parent_id: Optional[str] = None
    level: str = "chapter"
    title: str
    content: str = ""
    sort_order: Optional[int] = None


class OutlineUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    plot_points: Optional[list] = None
    word_count_target: Optional[int] = None
    emotion_curve: Optional[str] = None
    status: Optional[str] = None
    sort_order: Optional[int] = None
    parent_id: Optional[str] = None


class OutlineResponse(BaseModel):
    id: str
    book_id: str
    parent_id: Optional[str]
    level: str
    title: str
    content: str
    plot_points: list
    word_count_target: int
    emotion_curve: str
    sort_order: int
    status: str
    created_at: str

    model_config = {"from_attributes": True}


class OutlineTreeResponse(OutlineResponse):
    """包含 children 字段以供前端构建树"""
    children: list["OutlineTreeResponse"] = []

    model_config = {"from_attributes": True}