from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import ForeignKey

from app.core.database import Base


class InteractionSample(Base):

    __tablename__ = "interaction_sample"

    id = Column(Integer, primary_key=True)

    interaction_id = Column(
        Integer,
        ForeignKey("interaction.id")
    )

    sample_id = Column(
        Integer,
        ForeignKey("sample.id")
    )

    quantity = Column(Integer)