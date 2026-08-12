"""视频分析 DAO"""
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.entities import VideoAnalysis


class VideoAnalysisDAO:
    """视频分析数据访问"""

    @staticmethod
    async def create(db: AsyncSession, **kwargs) -> VideoAnalysis:
        record = VideoAnalysis(**kwargs)
        db.add(record)
        await db.flush()
        return record

    @staticmethod
    async def get(db: AsyncSession, task_id: str) -> VideoAnalysis | None:
        stmt = select(VideoAnalysis).where(VideoAnalysis.id == task_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_status(db: AsyncSession, task_id: str, status: str, **extra) -> None:
        stmt = update(VideoAnalysis).where(VideoAnalysis.id == task_id).values(status=status, **extra)
        await db.execute(stmt)

    @staticmethod
    async def list_by_match(db: AsyncSession, match_id: str) -> list[VideoAnalysis]:
        stmt = select(VideoAnalysis).where(VideoAnalysis.match_id == match_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())
