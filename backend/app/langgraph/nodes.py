"""
LangGraph assistant node.
Prepares messages for Groq API (ensures all ToolMessage content is a string),
extracts interaction_data from tool results, and returns updated state.
"""
from __future__ import annotations

import json
from typing import Optional

from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig

from app.langgraph.prompts import SYSTEM_PROMPT
from app.langgraph.llm import llm
from app.langgraph.tools import (
    log_interaction,
    edit_interaction,
    extract_products,
    analyze_sentiment,
    suggest_follow_up,
)

TOOLS = [
    log_interaction,
    edit_interaction,
    extract_products,
    analyze_sentiment,
    suggest_follow_up,
]

llm_with_tools = llm.bind_tools(TOOLS)


def assistant(state: dict, config: RunnableConfig = None) -> dict:
    """
    Main assistant node.

    1. Sanitize all ToolMessage content to strings (Groq requirement).
    2. Extract interaction_data from tool execution results.
    3. Call LLM with tools bound.
    4. Return updated state.
    """
    interaction_data: Optional[dict] = state.get("interaction_data")
    interaction_id: Optional[int] = state.get("interaction_id")

    cleaned_messages = []

    for msg in state["messages"]:
        content = msg.content

        # ── Normalize content to string ──────────────────────────────────────
        if content is None:
            content = ""
        elif not isinstance(content, str):
            try:
                content = json.dumps(content)
            except Exception:
                content = str(content)

        # ── Extract interaction_data from successful tool responses ──────────
        if msg.type == "tool":
            tool_name = getattr(msg, "name", "") or ""
            try:
                raw = json.loads(content) if content else {}
                if isinstance(raw, dict) and raw.get("success") is True:
                    data = raw.get("data", {})
                    if isinstance(data, dict):
                        interaction_data = data
                        # Normalize sentiment
                        sentiment = interaction_data.get("sentiment")
                        if isinstance(sentiment, str):
                            interaction_data["sentiment"] = sentiment.capitalize()
                        # Extract interaction_id if persisted
                        if data.get("interaction_id"):
                            interaction_id = data["interaction_id"]
            except Exception:
                pass

            # Groq: tool role content must be non-empty string
            if not content:
                content = "Tool executed successfully."

        # ── Copy message with sanitized content ──────────────────────────────
        try:
            new_msg = msg.model_copy(update={"content": content})
        except Exception:
            try:
                new_msg = msg.copy(update={"content": content})
            except Exception:
                msg.content = content
                new_msg = msg

        cleaned_messages.append(new_msg)

    # ── Invoke LLM ────────────────────────────────────────────────────────────
    response = llm_with_tools.invoke(
        [
            SystemMessage(content=SYSTEM_PROMPT),
            *cleaned_messages,
        ],
        config=config,
    )

    return {
        "messages": [response],
        "interaction_data": interaction_data,
        "interaction_id": interaction_id,
    }