from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class WritingLogResponse(BaseModel):
    id: str
    book_id: str
    user_id: str
    action: str
    description: str
    metadata: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}