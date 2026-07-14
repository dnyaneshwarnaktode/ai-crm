"""
LangGraph agent invocation.
Passes DB session, interaction_id, and full conversation history into the
graph so tools can persist data and the LLM has full context.
"""
from __future__ import annotations

from typing import Optional

from langchain_core.messages import HumanMessage, AIMessage
from sqlalchemy.orm import Session

from app.langgraph.graph import graph


def invoke_agent(
    user_input: str,
    db: Optional[Session] = None,
    history: Optional[list] = None,
    interaction_id: Optional[int] = None,
) -> dict:
    """
    Invoke the LangGraph CRM agent.

    Args:
        user_input:      The user's current message.
        db:              SQLAlchemy session — tools use this to persist data.
        history:         Prior LangChain messages for conversation context.
        interaction_id:  Active session ID injected into the system prompt so
                         the LLM uses the real integer in edit_interaction calls.

    Returns:
        Final graph state dict: messages, interaction_data, interaction_id.
    """
    # Build RunnableConfig — both db and interaction_id go into configurable
    configurable: dict = {}
    if db is not None:
        configurable["db"] = db
    if interaction_id is not None:
        configurable["interaction_id"] = interaction_id

    config = {"configurable": configurable} if configurable else {}

    # Build message list: [*previous_turns, current_message]
    prior_messages = history or []
    messages = [*prior_messages, HumanMessage(content=user_input)]

    result = graph.invoke(
        {"messages": messages},
        config=config,
    )

    return result