from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import ForeignKey

from app.core.database import Base


class InteractionMaterial(Base):

    __tablename__ = "interaction_material"

    id = Column(Integer, primary_key=True)

    interaction_id = Column(Integer,
                            ForeignKey("interaction.id"))

    material_id = Column(Integer,
                         ForeignKey("material.id"))