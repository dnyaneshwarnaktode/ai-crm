from pydantic import BaseModel, Field
from typing import Optional


class InteractionExtraction(BaseModel):

    hcp_name: Optional[str] = None
    interaction_type: Optional[str] = None
    interaction_date: Optional[str] = None
    interaction_time: Optional[str] = None

    attendees: Optional[str] = None
    topics_discussed: Optional[str] = None
    summary: Optional[str] = None

    products: list[str] = Field(default_factory=list)
    materials_shared: list[str] = Field(default_factory=list)
    samples_distributed: list[str] = Field(default_factory=list)

    sentiment: Optional[str] = None
    outcomes: Optional[str] = None
    follow_up: Optional[str] = None