import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    outline_id = Column(UUID(as_uuid=True), ForeignKey("outlines.id", ondelete="SET NULL"))
    title = Column(String(200), nullable=False)
    content = Column(Text, default="")
    ai_summary = Column(String(500), default="")
    word_count = Column(Integer, default=0)
    word_count_target = Column(Integer, default=0)
    characters = Column(ARRAY(UUID), default=list)
    key_events = Column(JSON, default=list)
    pleasure_points = Column(JSON, default=list)
    status = Column(String(20), default="draft")
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    book = relationship("Book", back_populates="chapters")
    versions = relationship("ChapterVersion", back_populates="chapter", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="chapter")


class ChapterVersion(Base):
    __tablename__ = "chapter_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(String(300), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    chapter = relationship("Chapter", back_populates="versions")