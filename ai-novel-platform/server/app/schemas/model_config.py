from pydantic import BaseModel
from typing import Optional


class ModelConfigCreate(BaseModel):
    name: str
    base_url: str
    api_key: str
    model_name: str
    scenes: list[str] = []


class ModelConfigUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    model_name: Optional[str] = None
    scenes: Optional[list[str]] = None
    is_active: Optional[bool] = None


class ModelConfigResponse(BaseModel):
    id: str
    name: str
    provider: str
    base_url: str
    model_name: str
    scenes: list[str]
    is_active: bool
    sort_order: int

    model_config = {"from_attributes": True}