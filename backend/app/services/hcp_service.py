from sqlalchemy.orm import Session

from app.models.hcp import HCP


class HCPService:

    def __init__(self, db: Session):

        self.db = db

    def get_by_name(self, name: str):
        from sqlalchemy import func
        return (
            self.db.query(HCP)
            .filter(func.lower(HCP.name) == name.lower())
            .first()
        )


    def create(self, name: str):

        doctor = HCP(

            name=name

        )

        self.db.add(doctor)

        self.db.commit()

        self.db.refresh(doctor)

        return doctor

    def get_or_create(self, name: str):

        doctor = self.get_by_name(name)

        if doctor:

            return doctor

        return self.create(name)