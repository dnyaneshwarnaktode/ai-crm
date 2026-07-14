from pydantic import BaseModel
from typing import Optional


class ToolResult(BaseModel):

    success: bool

    message: str

    interaction_id: Optional[int] = None

    interaction_data: Optional[dict] = None