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


def _parse_time(time_str: str) -> Optional[datetime.time]:
    """Robustly parse raw string to datetime.time."""
    if not time_str:
        return None
    import datetime
    time_str = time_str.strip().upper()
    try:
        return datetime.time.fromisoformat(time_str)
    except ValueError:
        pass
    for fmt in ("%I:%M %p", "%I %p", "%H:%M", "%I:%M%p", "%I%p"):
        try:
            return datetime.datetime.strptime(time_str, fmt).time()
        except ValueError:
            continue
    return None


def _parse_date(date_str: str) -> Optional[datetime.date]:
    """Robustly parse raw string to datetime.date."""
    if not date_str:
        return None
    import datetime
    date_str = date_str.strip()
    try:
        return datetime.date.fromisoformat(date_str)
    except ValueError:
        pass
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y"):
        try:
            return datetime.datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None


def _persist_interaction(db: Session, data: dict) -> dict:
    """
    Given extracted interaction data dict, find/create HCP and Interaction,
    then return the enriched data dict with interaction_id.
    """
    from app.services.hcp_service import HCPService
    from app.services.interaction_service import InteractionService
    from app.services.product_service import ProductService
    from app.models.interaction_product import InteractionProduct
    from app.models.material import Material
    from app.models.interaction_material import InteractionMaterial
    from app.models.sample import Sample
    from app.models.interaction_sample import InteractionSample
    import datetime

    hcp_name = data.get("hcp_name") or "Unknown"
    hcp_svc = HCPService(db)
    hcp = hcp_svc.get_or_create(hcp_name)

    # Parse date / time safely
    interaction_date = _parse_date(data.get("interaction_date")) or datetime.date.today()
    interaction_time = _parse_time(data.get("interaction_time"))

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

    # Persist materials_shared
    from sqlalchemy import func
    for mat_name in (data.get("materials_shared") or []):
        if mat_name:
            material = db.query(Material).filter(func.lower(Material.material_name) == mat_name.lower()).first()
            if not material:
                material = Material(material_name=mat_name)
                db.add(material)
                db.flush()
            link = InteractionMaterial(
                interaction_id=interaction.id,
                material_id=material.id,
            )
            db.add(link)

    # Persist samples_distributed
    for sample_name in (data.get("samples_distributed") or []):
        if sample_name:
            sample = db.query(Sample).filter(func.lower(Sample.sample_name) == sample_name.lower()).first()
            if not sample:
                sample = Sample(sample_name=sample_name, quantity=100)
                db.add(sample)
                db.flush()
            link = InteractionSample(
                interaction_id=interaction.id,
                sample_id=sample.id,
                quantity=1,
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
    from app.models.material import Material
    from app.models.interaction_material import InteractionMaterial
    from app.models.sample import Sample
    from app.models.interaction_sample import InteractionSample

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
    updates = {}
    for k, v in changes.items():
        if k in safe_fields and v not in [None, "", []]:
            if k == "interaction_date":
                parsed_d = _parse_date(v)
                if parsed_d:
                    updates[k] = parsed_d
            elif k == "interaction_time":
                parsed_t = _parse_time(v)
                if parsed_t:
                    updates[k] = parsed_t
            else:
                updates[k] = v


    svc = InteractionService(db)
    svc.update(interaction, updates)

    # Update HCP if provided
    hcp_name = changes.get("hcp_name")
    if hcp_name:
        from app.services.hcp_service import HCPService
        hcp_svc = HCPService(db)
        hcp = hcp_svc.get_or_create(hcp_name)
        interaction.hcp_id = hcp.id


    # Update products if provided
    new_products = changes.get("products")
    if new_products is not None:
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

    # Update materials if provided
    from sqlalchemy import func
    new_materials = changes.get("materials_shared")
    if new_materials is not None:
        db.query(InteractionMaterial).filter(
            InteractionMaterial.interaction_id == interaction_id
        ).delete()
        for mat_name in new_materials:
            if mat_name:
                material = db.query(Material).filter(func.lower(Material.material_name) == mat_name.lower()).first()
                if not material:
                    material = Material(material_name=mat_name)
                    db.add(material)
                    db.flush()
                link = InteractionMaterial(
                    interaction_id=interaction.id,
                    material_id=material.id,
                )
                db.add(link)

    # Update samples if provided
    new_samples = changes.get("samples_distributed")
    if new_samples is not None:
        db.query(InteractionSample).filter(
            InteractionSample.interaction_id == interaction_id
        ).delete()
        for sample_name in new_samples:
            if sample_name:
                sample = db.query(Sample).filter(func.lower(Sample.sample_name) == sample_name.lower()).first()
                if not sample:
                    sample = Sample(sample_name=sample_name, quantity=100)
                    db.add(sample)
                    db.flush()
                link = InteractionSample(
                    interaction_id=interaction.id,
                    sample_id=sample.id,
                    quantity=1,
                )
                db.add(link)


    db.commit()

    return {
        "interaction_id": interaction.id,
        "hcp_id": interaction.hcp_id,
        "hcp_name": interaction.hcp.name if interaction.hcp else None,
        "interaction_type": interaction.interaction_type,
        "interaction_date": interaction.interaction_date.isoformat() if interaction.interaction_date else None,
        "interaction_time": interaction.interaction_time.isoformat() if interaction.interaction_time else None,
        "attendees": interaction.attendees,
        "topics_discussed": interaction.topics_discussed,
        "summary": interaction.summary,
        "sentiment": interaction.sentiment,
        "outcomes": interaction.outcomes,
        "follow_up": interaction.follow_up,
        "products": [p.product.product_name for p in interaction.products if p.product] if interaction.products else [],
        "materials_shared": [m.material.material_name for m in interaction.materials if m.material] if interaction.materials else [],
        "samples_distributed": [s.sample.sample_name for s in interaction.samples if s.sample] if interaction.samples else [],
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
def extract_products(text: str, config: RunnableConfig = None) -> list[str]:
    """
    Extract product names mentioned in the text.
    Use this tool when the user asks what products were discussed.
    """
    db = _get_db(config)
    if db:
        try:
            from app.models.product import Product
            products = db.query(Product).all()
            found = [p.product_name for p in products if p.product_name.lower() in text.lower()]
            if found:
                return found
        except Exception:
            pass
    # Fallback to common products
    return [p for p in ("Ozempic", "Metformin", "Wegovy", "Mounjaro") if p.lower() in text.lower()]


@tool
def analyze_sentiment(text: str) -> dict:
    """
    Analyze the sentiment of an interaction.
    Returns positive, negative, or neutral sentiment.
    Use this tool when the user asks about the doctor's reaction or sentiment.
    """
    txt = text.lower()
    if any(w in txt for w in ("positive", "liked", "good", "great", "excellent", "happy", "satisfied")):
        return {"sentiment": "Positive"}
    if any(w in txt for w in ("negative", "disliked", "bad", "poor", "unhappy", "unsatisfied")):
        return {"sentiment": "Negative"}
    return {"sentiment": "Neutral"}


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