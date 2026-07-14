from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String

from app.core.database import Base


class Material(Base):

    __tablename__ = "material"

    id = Column(Integer, primary_key=True)

    material_name = Column(String(255))

    description = Column(String)