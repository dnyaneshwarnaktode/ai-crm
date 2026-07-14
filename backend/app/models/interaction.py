from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    Time,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Interaction(Base):

    __tablename__ = "interaction"

    id = Column(Integer, primary_key=True)

    hcp_id = Column(Integer, ForeignKey("hcp.id"))

    interaction_type = Column(String(100))

    interaction_date = Column(Date)

    interaction_time = Column(Time)

    attendees = Column(Text)

    topics_discussed = Column(Text)

    summary = Column(Text)

    voice_summary = Column(Text)

    outcomes = Column(Text)

    follow_up = Column(Text)

    sentiment = Column(String(50))

    hcp = relationship(
        "HCP",
        back_populates="interactions"
    )

    products = relationship(
        "InteractionProduct",
        back_populates="interaction",
        cascade="all, delete"
    )

    materials = relationship(
        "InteractionMaterial",
        back_populates="interaction",
        cascade="all, delete"
    )

    samples = relationship(
        "InteractionSample",
        back_populates="interaction",
        cascade="all, delete"
    )

    chats = relationship(
        "ChatHistory",
        cascade="all, delete"
    )

    ai_metadata = relationship(
        "AIMetadata",
        cascade="all, delete"
    )

    created_at = Column(DateTime(timezone=True),
                        server_default=func.now())

    updated_at = Column(DateTime(timezone=True),
                        server_default=func.now(),
                        onupdate=func.now())