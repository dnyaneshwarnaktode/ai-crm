from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String

from app.core.database import Base


class Sample(Base):

    __tablename__ = "sample"

    id = Column(Integer, primary_key=True)

    sample_name = Column(String(255))

    quantity = Column(Integer)