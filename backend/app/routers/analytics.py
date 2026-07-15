from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.hcp import HCP
from app.models.interaction import Interaction
from app.models.interaction_product import InteractionProduct
from app.models.product import Product

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/")
def get_metrics(db: Session = Depends(get_db)):
    """Calculate and return key CRM performance and engagement statistics."""
    total_hcps = db.query(HCP).count()
    total_interactions = db.query(Interaction).count()

    # Calculate sentiment distribution
    sentiment_counts = (
        db.query(Interaction.sentiment, func.count(Interaction.id))
        .group_by(Interaction.sentiment)
        .all()
    )
    sentiments = {"positive": 0, "neutral": 0, "negative": 0}
    for sent, count in sentiment_counts:
        if sent:
            sent_lower = sent.lower()
            if sent_lower in sentiments:
                sentiments[sent_lower] = count

    # Calculate top discussed products
    product_stats = (
        db.query(Product.product_name, func.count(InteractionProduct.id))
        .join(InteractionProduct, Product.id == InteractionProduct.product_id)
        .group_by(Product.product_name)
        .order_by(func.count(InteractionProduct.id).desc())
        .limit(5)
        .all()
    )
    products_breakdown = [
        {"name": name, "count": count} for name, count in product_stats
    ]

    return {
        "total_hcps": total_hcps,
        "total_interactions": total_interactions,
        "sentiments": sentiments,
        "products": products_breakdown,
    }
