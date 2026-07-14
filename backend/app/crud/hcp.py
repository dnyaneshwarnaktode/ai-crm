from sqlalchemy.orm import Session

from app.models.hcp import HCP


def create_hcp(db: Session, data: dict):

    doctor = HCP(**data)

    db.add(doctor)

    db.commit()

    db.refresh(doctor)

    return doctor


def get_hcp_by_name(db: Session, name: str):

    return db.query(HCP).filter(
        HCP.name == name
    ).first()