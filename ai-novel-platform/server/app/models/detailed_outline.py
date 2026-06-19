"""细纲模型 — 描述每章每个场景的具体写法"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base


class DetailedOutline(Base):
    __tablename__ = "detailed_outlines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"))
    outline_id = Column(UUID(as_uuid=True), ForeignKey("outlines.id", ondelete="SET NULL"))

    scene_index = Column(Integer, nullable=False, default=0)
    title = Column(String(200), nullable=False)
    function = Column(String(30), default="")
    emotion = Column(String(20), default="")
    word_count_target = Column(Integer, default=0)

    characters = Column(ARRAY(UUID), default=list)
    location = Column(String(200), default="")
    day_number = Column(Integer, default=0)

    description = Column(Text, default="")
    key_dialogues = Column(Text, default="")
    pleasure_types = Column(ARRAY(String), default=list)

    status = Column(String(20), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    book = relationship("Book")