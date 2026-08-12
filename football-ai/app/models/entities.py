"""ORM 模型"""
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class AIChatHistory(Base):
    """AI 对话历史"""
    __tablename__ = "ai_chat_history"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    session_id: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(16), nullable=False)  # user/assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tokens: Mapped[int] = mapped_column(Integer, default=0)
    create_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class VideoAnalysis(Base):
    """视频分析"""
    __tablename__ = "video_analyses"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    match_id: Mapped[str] = mapped_column(String(32), index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    video_url: Mapped[str] = mapped_column(String(500))
    thumbnail: Mapped[str] = mapped_column(String(500))
    duration: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(16), default="pending")
    ai_summary: Mapped[str] = mapped_column(Text)
    ai_tags: Mapped[dict] = mapped_column(JSON)
    clips: Mapped[dict] = mapped_column(JSON)
    create_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    update_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
