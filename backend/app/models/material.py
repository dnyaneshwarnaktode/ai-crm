from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Material(Base):

    __tablename__ = "material"

    id = Column(Integer, primary_key=True)

    material_name = Column(String(255))

    description = Column(String)

    interactions = relationship(
        "InteractionMaterial",
        back_populates="material"
    )