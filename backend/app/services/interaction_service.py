from sqlalchemy.orm import Session

from app.models.interaction import Interaction


class InteractionService:

    def __init__(self, db: Session):

        self.db = db

    def create(self, data: dict):

        interaction = Interaction(

            **data

        )

        self.db.add(interaction)

        self.db.commit()

        self.db.refresh(interaction)

        return interaction

    def update(self, interaction, updates):

        for key, value in updates.items():

            setattr(interaction, key, value)

        self.db.commit()

        self.db.refresh(interaction)

        return interaction