from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class HCP(Base):

    __tablename__ = "hcp"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)

    specialization = Column(String(255))

    hospital = Column(String(255))

    city = Column(String(255))

    email = Column(String(255))

    phone = Column(String(30))

    interactions = relationship(
        "Interaction",
        back_populates="hcp",
        cascade="all, delete"
    )

    created_at = Column(DateTime(timezone=True),
                        server_default=func.now())

    updated_at = Column(DateTime(timezone=True),
                        server_default=func.now(),
                        onupdate=func.now())