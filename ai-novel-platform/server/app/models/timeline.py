import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"))
    day_number = Column(Integer, nullable=False)
    event_desc = Column(String(500), nullable=False)
    involved_chars = Column(ARRAY(UUID), default=list)
    location = Column(String(200), default="")
    season = Column(String(10), default="")
    importance = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)

    book = relationship("Book", back_populates="timeline_events")


class CharStateLog(Base):
    __tablename__ = "char_state_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    character_id = Column(UUID(as_uuid=True), ForeignKey("characters.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"))
    chapter_number = Column(Integer, nullable=False)
    state_snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    character = relationship("Character", back_populates="state_logs")