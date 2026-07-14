from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class InteractionMaterial(Base):

    __tablename__ = "interaction_material"

    id = Column(Integer, primary_key=True)

    interaction_id = Column(
        Integer,
        ForeignKey("interaction.id")
    )

    material_id = Column(
        Integer,
        ForeignKey("material.id")
    )

    interaction = relationship(
        "Interaction",
        back_populates="materials"
    )

    material = relationship(
        "Material",
        back_populates="interactions"
    )