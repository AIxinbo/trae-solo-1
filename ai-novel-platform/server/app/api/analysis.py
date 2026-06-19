"""拆书分析路由"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.analysis import AnalysisRecord
from app.middleware.auth import get_current_user

router = APIRouter()


@router.post("/")
async def analyze_text(
    data: dict,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """拆书分析（TODO: Step 6 实现）"""
    return {
        "status": "pending",
        "message": "拆书分析功能将在 Step 6 中实现"
    }


@router.get("/records")
async def list_analysis_records(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取分析记录列表"""
    result = await db.execute(
        select(AnalysisRecord).where(AnalysisRecord.user_id == user_id)
        .order_by(AnalysisRecord.created_at.desc())
    )
    records = result.scalars().all()
    return [
        {"id": str(r.id), "source_title": r.source_title, "created_at": r.created_at.isoformat()}
        for r in records
    ]