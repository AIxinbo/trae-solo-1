import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="SET NULL"))
    target_type = Column(String(10), nullable=False)  # outline, chapter
    target_id = Column(UUID(as_uuid=True), nullable=False)
    overall_score = Column(Integer, nullable=False)
    passed = Column(Boolean, nullable=False, default=True)
    rewrite_required = Column(Boolean, default=False)
    dimension_scores = Column(JSON, nullable=False)
    priority_issues = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    book = relationship("Book", back_populates="reviews")
    chapter = relationship("Chapter", back_populates="reviews")