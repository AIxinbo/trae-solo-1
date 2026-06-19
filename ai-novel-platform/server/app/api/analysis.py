"""拆书分析路由 — 4个并行分析 Agent"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.analysis import AnalysisRecord
from app.models.writing_log import WritingLog
from app.middleware.auth import get_current_user
from app.services.analysis.engine import AnalysisEngine

router = APIRouter()
logger = logging.getLogger(__name__)


class AnalyzeRequest(BaseModel):
    content: str
    source_title: str = ""
    source_author: str = ""
    source_type: str = "manual"


class AnalyzeResponse(BaseModel):
    success: bool
    message: str = ""
    record_id: str = ""
    data: dict | None = None


@router.post("/{book_id}/analyze", response_model=AnalyzeResponse)
async def analyze_text(
    book_id: str,
    req: AnalyzeRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """拆书分析：4个并行 Agent 分析参考作品"""
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="分析内容不能为空")
    if len(req.content) < 100:
        raise HTTPException(status_code=400, detail="文本太短，至少需要100字")

    try:
        engine = AnalysisEngine(db, user_id, book_id)
        result = await engine.analyze(
            content=req.content,
            source_title=req.source_title or "未命名作品",
            source_author=req.source_author,
        )

        # 保存分析记录
        record = AnalysisRecord(
            book_id=book_id,
            user_id=user_id,
            source_title=result["source_title"],
            source_author=result["source_author"],
            source_type=req.source_type,
            source_content=req.content[:5000],
            structure_analysis=result["structure_analysis"],
            character_analysis=result["character_analysis"],
            rhythm_analysis=result["rhythm_analysis"],
            techniques=result["techniques"],
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)

        # 写入日志
        log = WritingLog(
            book_id=book_id,
            user_id=user_id,
            action="analysis",
            description=f"拆书分析：{result['source_title']}",
            metadata={"source_title": result["source_title"]},
        )
        db.add(log)
        await db.commit()

        return AnalyzeResponse(
            success=True,
            message="拆书分析完成",
            record_id=str(record.id),
            data=result,
        )
    except Exception as e:
        logger.error(f"拆书分析失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")


@router.get("/{book_id}/analysis-records")
async def list_analysis_records(
    book_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取分析记录列表"""
    result = await db.execute(
        select(AnalysisRecord)
        .where(AnalysisRecord.book_id == book_id)
        .order_by(AnalysisRecord.created_at.desc())
        .limit(20)
    )
    records = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "source_title": r.source_title,
            "source_author": r.source_author,
            "source_type": r.source_type,
            "structure_analysis": r.structure_analysis,
            "character_analysis": r.character_analysis,
            "rhythm_analysis": r.rhythm_analysis,
            "techniques": r.techniques,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]


@router.get("/analysis-records/{record_id}")
async def get_analysis_record(
    record_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取单条分析记录详情"""
    result = await db.execute(select(AnalysisRecord).where(AnalysisRecord.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="分析记录不存在")

    return {
        "id": str(record.id),
        "source_title": record.source_title,
        "source_author": record.source_author,
        "source_type": record.source_type,
        "structure_analysis": record.structure_analysis,
        "character_analysis": record.character_analysis,
        "rhythm_analysis": record.rhythm_analysis,
        "techniques": record.techniques,
        "created_at": record.created_at.isoformat(),
    }