from pydantic import BaseModel
from typing import Optional


class ReviewRequest(BaseModel):
    chapter_id: str


class ReviewResponse(BaseModel):
    review_id: str
    overall_score: int
    passed: bool
    rewrite_required: bool
    dimensions: dict
    priority_issues: list