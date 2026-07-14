from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Text
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class ChatHistory(Base):

    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True)

    interaction_id = Column(
        Integer,
        ForeignKey("interaction.id")
    )

    role = Column(String(20))

    message = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )