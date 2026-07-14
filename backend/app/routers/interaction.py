from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.interaction import Interaction
from app.models.interaction_product import InteractionProduct
from app.models.product import Product

router = APIRouter(
    prefix="/interactions",
    tags=["Interactions"],
)


@router.get("/")
def list_interactions(db: Session = Depends(get_db)):
    """List all interactions with HCP name."""
    interactions = (
        db.query(Interaction)
        .options(joinedload(Interaction.hcp))
        .order_by(Interaction.id.desc())
        .all()
    )
    return [_serialize(i) for i in interactions]


@router.get("/{interaction_id}")
def get_interaction(
    interaction_id: int,
    db: Session = Depends(get_db),
):
    """Get a single interaction with all details."""
    interaction = (
        db.query(Interaction)
        .options(
            joinedload(Interaction.hcp),
            joinedload(Interaction.products).joinedload(InteractionProduct.product),
        )
        .filter(Interaction.id == interaction_id)
        .first()
    )
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return _serialize(interaction, full=True)


# ── helpers ───────────────────────────────────────────────────────────────────

def _serialize(interaction: Interaction, full: bool = False) -> dict:
    data = {
        "id": interaction.id,
        "hcp_id": interaction.hcp_id,
        "hcp_name": interaction.hcp.name if interaction.hcp else None,
        "interaction_type": interaction.interaction_type,
        "interaction_date": (
            interaction.interaction_date.isoformat()
            if interaction.interaction_date else None
        ),
        "sentiment": interaction.sentiment,
        "created_at": (
            interaction.created_at.isoformat()
            if interaction.created_at else None
        ),
    }
    if full:
        data.update({
            "interaction_time": (
                interaction.interaction_time.isoformat()
                if interaction.interaction_time else None
            ),
            "attendees": interaction.attendees,
            "topics_discussed": interaction.topics_discussed,
            "summary": interaction.summary,
            "outcomes": interaction.outcomes,
            "follow_up": interaction.follow_up,
            "products": [
                ip.product.product_name
                for ip in (interaction.products or [])
                if ip.product
            ],
        })
    return data