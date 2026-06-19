from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """自动建表（启动时调用）"""
    async with engine.begin() as conn:
        from app.models.user import User
        from app.models.book import Book
        from app.models.outline import Outline
        from app.models.detailed_outline import DetailedOutline
        from app.models.character import Character
        from app.models.chapter import Chapter, ChapterVersion
        from app.models.review import Review
        from app.models.timeline import TimelineEvent, CharStateLog
        from app.models.analysis import AnalysisRecord
        from app.models.model_config import UserModelConfig
        from app.models.writing_log import WritingLog
        await conn.run_sync(Base.metadata.create_all)