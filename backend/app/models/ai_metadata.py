from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class AIMetadata(Base):

    __tablename__ = "ai_metadata"

    id = Column(Integer, primary_key=True)

    interaction_id = Column(
        Integer,
        ForeignKey("interaction.id")
    )

    confidence = Column(Float)

    entities = Column(JSONB)

    raw_llm_output = Column(JSONB)

    tool_used = Column(String(100))

    processing_time = Column(Float)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )