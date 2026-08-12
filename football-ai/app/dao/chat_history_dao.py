"""AI 对话历史 DAO"""
from datetime import datetime
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.entities import AIChatHistory


class ChatHistoryDAO:
    """对话历史数据访问"""

    @staticmethod
    async def create(db: AsyncSession, **kwargs) -> AIChatHistory:
        record = AIChatHistory(**kwargs)
        db.add(record)
        await db.flush()
        return record

    @staticmethod
    async def list_by_session(db: AsyncSession, session_id: str, limit: int = 50) -> list[AIChatHistory]:
        stmt = (
            select(AIChatHistory)
            .where(AIChatHistory.session_id == session_id)
            .order_by(AIChatHistory.create_time)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def list_by_user(db: AsyncSession, user_id: str, limit: int = 100) -> list[AIChatHistory]:
        stmt = (
            select(AIChatHistory)
            .where(AIChatHistory.user_id == user_id)
            .order_by(desc(AIChatHistory.create_time))
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())
