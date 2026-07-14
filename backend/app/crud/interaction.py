from sqlalchemy.orm import Session

from app.models.interaction import Interaction


def create_interaction(db: Session, data: dict):

    interaction = Interaction(**data)

    db.add(interaction)

    db.commit()

    db.refresh(interaction)

    return interaction


def get_interaction(db: Session, interaction_id: int):

    return db.query(Interaction).filter(
        Interaction.id == interaction_id
    ).first()