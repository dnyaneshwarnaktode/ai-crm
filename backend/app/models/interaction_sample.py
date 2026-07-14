from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

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

    interaction = relationship(
        "Interaction",
        back_populates="samples"
    )

    sample = relationship(
        "Sample",
        back_populates="interactions"
    )