from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.chat import ChatRequest
from app.services.chat_service import ChatService
from app.models.chat_history import ChatHistory

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post("/")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    """Send a message to the AI CRM assistant."""
    service = ChatService(db)
    return service.process_message(request)


@router.get("/history/{interaction_id}")
def get_chat_history(
    interaction_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve full chat history for a given interaction session."""
    messages = (
        db.query(ChatHistory)
        .filter(ChatHistory.interaction_id == interaction_id)
        .order_by(ChatHistory.id.asc())
        .all()
    )
    return [
        {
            "id": m.id,
            "role": m.role,
            "message": m.message,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]