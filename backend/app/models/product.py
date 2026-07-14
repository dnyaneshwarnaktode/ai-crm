from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Product(Base):

    __tablename__ = "product"

    id = Column(Integer, primary_key=True)

    product_name = Column(String(255), unique=True)

    category = Column(String(255))

    description = Column(String)

    interactions = relationship(
        "InteractionProduct",
        back_populates="product"
    )