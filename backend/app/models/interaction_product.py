from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class InteractionProduct(Base):

    __tablename__ = "interaction_product"

    id = Column(Integer, primary_key=True)

    interaction_id = Column(
        Integer,
        ForeignKey("interaction.id")
    )

    product_id = Column(
        Integer,
        ForeignKey("product.id")
    )

    interaction = relationship(
        "Interaction",
        back_populates="products"
    )

    product = relationship(
        "Product",
        back_populates="interactions"
    )