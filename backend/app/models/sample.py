from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Sample(Base):

    __tablename__ = "sample"

    id = Column(Integer, primary_key=True)

    sample_name = Column(String(255))

    quantity = Column(Integer)

    interactions = relationship(
        "InteractionSample",
        back_populates="sample"
    )