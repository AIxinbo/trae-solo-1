"""AI 对话路由"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.schemas import ApiResponse, ChatRequest, ChatResponse
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["AI 对话"])


@router.post("", response_model=ApiResponse)
async def chat(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    """AI 对话"""
    # TODO: 从 JWT 获取 user_id，暂时用默认值
    user_id = "u_admin"
    result = await ChatService.chat(db, user_id, req)
    return ApiResponse(data=result)
