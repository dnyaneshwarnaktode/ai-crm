"""
LangGraph tools for the AI CRM assistant.

DB Session Injection Pattern:
  Tools receive the SQLAlchemy Session via LangGraph RunnableConfig:
    config["configurable"]["db"]
  The session is injected in agent.py when invoking the graph.
"""
from __future__ import annotations

import json
from typing import Optional

from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from sqlalchemy.orm import Session

from app.services.llm_parser import extract_interaction
from app.langgraph.llm import llm


# ── helpers ───────────────────────────────────────────────────────────────────

def _get_db(config: RunnableConfig) -> Optional[Session]:
    """Extract the DB session from RunnableConfig if present."""
    return (config or {}).get("configurable", {}).get("db")


def _persist_interaction(db: Session, data: dict) -> dict:
    """
    Given extracted interaction data dict, find/create HCP and Interaction,
    then return the enriched data dict with interaction_id.
    """
    from app.services.hcp_service import HCPService
    from app.services.interaction_service import InteractionService
    from app.services.product_service import ProductService
    from app.models.interaction_product import InteractionProduct
    import datetime

    hcp_name = data.get("hcp_name") or "Unknown"
    hcp_svc = HCPService(db)
    hcp = hcp_svc.get_or_create(hcp_name)

    # Parse date / time safely
    interaction_date = None
    raw_date = data.get("interaction_date")
    if raw_date:
        try:
            interaction_date = datetime.date.fromisoformat(raw_date)
        except Exception:
            interaction_date = datetime.date.today()
    else:
        interaction_date = datetime.date.today()

    interaction_time = None
    raw_time = data.get("interaction_time")
    if raw_time:
        try:
            interaction_time = datetime.time.fromisoformat(raw_time)
        except Exception:
            pass

    interaction_payload = {
        "hcp_id": hcp.id,
        "interaction_type": data.get("interaction_type"),
        "interaction_date": interaction_date,
        "interaction_time": interaction_time,
        "attendees": data.get("attendees"),
        "topics_discussed": data.get("topics_discussed"),
        "summary": data.get("summary"),
        "sentiment": data.get("sentiment"),
        "outcomes": data.get("outcomes"),
        "follow_up": data.get("follow_up"),
    }

    interaction_svc = InteractionService(db)
    interaction = interaction_svc.create(interaction_payload)

    # Persist products
    product_svc = ProductService(db)
    for product_name in (data.get("products") or []):
        if product_name:
            product = product_svc.get_or_create(product_name)
            link = InteractionProduct(
                interaction_id=interaction.id,
                product_id=product.id,
            )
            db.add(link)
    db.commit()

    return {**data, "interaction_id": interaction.id, "hcp_id": hcp.id}


def _update_interaction(db: Session, interaction_id: int, changes: dict) -> dict:
    """Load an existing Interaction from DB, apply non-null changes, persist."""
    from app.models.interaction import Interaction
    from app.services.interaction_service import InteractionService
    from app.services.product_service import ProductService
    from app.models.interaction_product import InteractionProduct

    interaction = db.query(Interaction).filter(
        Interaction.id == interaction_id
    ).first()

    if not interaction:
        return {"error": f"Interaction {interaction_id} not found"}

    safe_fields = {
        "interaction_type", "interaction_date", "interaction_time",
        "attendees", "topics_discussed", "summary",
        "sentiment", "outcomes", "follow_up",
    }
    updates = {
        k: v for k, v in changes.items()
        if k in safe_fields and v not in [None, "", []]
    }

    svc = InteractionService(db)
    svc.update(interaction, updates)

    # Update products if provided
    new_products = changes.get("products")
    if new_products:
        # Remove old links
        db.query(InteractionProduct).filter(
            InteractionProduct.interaction_id == interaction_id
        ).delete()
        product_svc = ProductService(db)
        for product_name in new_products:
            if product_name:
                product = product_svc.get_or_create(product_name)
                link = InteractionProduct(
                    interaction_id=interaction.id,
                    product_id=product.id,
                )
                db.add(link)
        db.commit()

    return {
        "interaction_id": interaction.id,
        "hcp_id": interaction.hcp_id,
        "interaction_type": interaction.interaction_type,
        "topics_discussed": interaction.topics_discussed,
        "summary": interaction.summary,
        "sentiment": interaction.sentiment,
        "outcomes": interaction.outcomes,
        "follow_up": interaction.follow_up,
        "products": new_products or [],
    }


# ── tools ─────────────────────────────────────────────────────────────────────

@tool
def log_interaction(text: str, config: RunnableConfig = None) -> dict:
    """
    Log a new CRM interaction with an HCP.
    Extracts structured data from the user's text and saves it to the database.
    Use this tool when the user describes a new meeting or interaction.
    """
    data = extract_interaction(text)

    db = _get_db(config)
    if db:
        data = _persist_interaction(db, data)

    return {"success": True, "data": data}


@tool
def edit_interaction(
    interaction_id: int,
    correction: str,
    config: RunnableConfig = None,
) -> dict:
    """
    Edit or update an existing CRM interaction record.
    Use this tool when the user wants to correct or add information to a previously logged interaction.
    Requires the interaction_id of the record to update.
    """
    changes = extract_interaction(correction)

    db = _get_db(config)
    if db:
        result = _update_interaction(db, interaction_id, changes)
        return {"success": True, "data": result}

    return {"success": True, "data": changes}


@tool
def extract_products(text: str) -> list[str]:
    """
    Extract product names mentioned in the text.
    Use this tool when the user asks what products were discussed.
    """
    data = extract_interaction(text)
    return data.get("products", [])


@tool
def analyze_sentiment(text: str) -> dict:
    """
    Analyze the sentiment of an interaction.
    Returns positive, negative, or neutral sentiment.
    Use this tool when the user asks about the doctor's reaction or sentiment.
    """
    data = extract_interaction(text)
    return {"sentiment": data.get("sentiment")}


@tool
def suggest_follow_up(summary: str) -> str:
    """
    Suggest a follow-up action based on the interaction summary.
    Use this tool when the user asks for next steps or follow-up recommendations.
    """
    response = llm.invoke(
        f"Based on this CRM interaction summary, suggest one specific follow-up action "
        f"that a pharmaceutical representative should take:\n\n{summary}\n\n"
        f"Return only the follow-up recommendation in one sentence."
    )
    return response.content.strip()