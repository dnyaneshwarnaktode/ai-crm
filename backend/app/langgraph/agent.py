"""
LangGraph agent invocation.
Passes DB session into the graph via RunnableConfig so tools can persist data.
"""
from __future__ import annotations

from typing import Optional

from langchain_core.messages import HumanMessage
from sqlalchemy.orm import Session

from app.langgraph.graph import graph


def invoke_agent(user_input: str, db: Optional[Session] = None) -> dict:
    """
    Invoke the LangGraph CRM agent.

    Args:
        user_input: The user's chat message.
        db: Optional SQLAlchemy session. When provided, tools can persist data.

    Returns:
        The final graph state dict containing messages, interaction_data,
        interaction_id.
    """
    config = {}
    if db is not None:
        config = {"configurable": {"db": db}}

    result = graph.invoke(
        {
            "messages": [HumanMessage(content=user_input)],
        },
        config=config,
    )

    return result