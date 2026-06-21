import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Outline(Base):
    __tablename__ = "outlines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("outlines.id", ondelete="CASCADE"))
    level = Column(String(10), nullable=False)  # volume, chapter, section
    title = Column(String(200), nullable=False)
    content = Column(Text, default="")
    plot_points = Column(JSON, default=list)
    word_count_target = Column(Integer, default=0)
    emotion_curve = Column(String(20), default="")
    sort_order = Column(Integer, nullable=False, default=0)
    ai_summary = Column(Text, default="")
    status = Column(String(20), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    book = relationship("Book", back_populates="outlines")
    children = relationship("Outline", backref="parent", remote_side=[id])