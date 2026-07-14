from pydantic import BaseModel
from datetime import date
from datetime import time


class InteractionCreate(BaseModel):

    hcp_id: int

    interaction_type: str

    interaction_date: date

    interaction_time: time

    attendees: str | None = None

    topics_discussed: str | None = None

    summary: str | None = None

    voice_summary: str | None = None

    outcomes: str | None = None

    follow_up: str | None = None

    sentiment: str | None = None


class InteractionResponse(InteractionCreate):

    id: int

    class Config:
        from_attributes = True