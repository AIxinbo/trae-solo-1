"""写作历程日志路由 — 在工作台展示用户操作记录"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.writing_log import WritingLog
from app.schemas.writing_log import WritingLogResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/{book_id}/writing-logs", response_model=list[WritingLogResponse])
async def list_writing_logs(
    book_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WritingLog).where(WritingLog.book_id == book_id)
        .order_by(WritingLog.created_at.desc())
        .offset(offset).limit(limit)
    )
    return [WritingLogResponse.model_validate(log) for log in result.scalars().all()]