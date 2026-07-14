from typing import Annotated
from typing import Optional
from typing_extensions import TypedDict

from langgraph.graph.message import add_messages


class CRMState(TypedDict):

    messages: Annotated[list, add_messages]

    interaction_data: Optional[dict]

    interaction_id: Optional[int]