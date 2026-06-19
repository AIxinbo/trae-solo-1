import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="SET NULL"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    source_title = Column(String(200), nullable=False)
    source_author = Column(String(100), default="")
    source_type = Column(String(20), default="manual")
    source_content = Column(Text, default="")
    structure_analysis = Column(JSON, default=dict)
    character_analysis = Column(JSON, default=dict)
    rhythm_analysis = Column(JSON, default=dict)
    techniques = Column(JSON, default=dict)
    templates = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)