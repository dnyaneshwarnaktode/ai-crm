from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    message: str
    interaction_id: Optional[int] = None


class ChatResponse(BaseModel):
    success: bool
    assistant_message: str
    interaction_data: Optional[dict] = None
    interaction_id: Optional[int] = None