import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base


class Character(Base):
    __tablename__ = "characters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(String(20), default="")
    gender = Column(String(10), default="")
    role_type = Column(String(20), nullable=False, default="supporter")
    appearance = Column(Text, default="")
    personality = Column(Text, default="")
    background = Column(Text, default="")
    motivation = Column(Text, default="")
    growth_arc = Column(JSON, default=list)
    relationships = Column(JSON, default=list)

    # 语音特征
    speech_style = Column(String(30), default="普通")
    formality_level = Column(Float, default=0.5)
    avg_sentence_len = Column(Integer, default=8)
    favorite_words = Column(ARRAY(String), default=list)
    forbidden_words = Column(ARRAY(String), default=list)
    tone_words = Column(ARRAY(String), default=list)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    book = relationship("Book", back_populates="characters")
    state_logs = relationship("CharStateLog", back_populates="character", cascade="all, delete-orphan")