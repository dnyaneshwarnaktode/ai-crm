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

llm_with_tools = llm.bind_tools(TOOLS, parallel_tool_calls=False)



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

    # ── Build dynamic system prompt with active session context ─────────────
    # Read interaction_id from config so the LLM knows the real integer ID
    # and won't hallucinate placeholder strings when calling edit_interaction.
    config_interaction_id = (
        (config or {}).get("configurable", {}).get("interaction_id")
    )
    active_id = interaction_id or config_interaction_id

    if active_id:
        session_context = (
            f"\n\nCRITICAL CONSTRAINTS FOR ACTIVE SESSION:\n"
            f"1. There is an ACTIVE session in progress (Interaction ID: {active_id}).\n"
            f"2. You MUST NOT call the `log_interaction` tool under any circumstance.\n"
            f"3. Any new details, products, or changes provided by the user MUST be treated as updates to the current active interaction. You MUST call `edit_interaction` with `interaction_id={active_id}` to merge these changes.\n"
            f"4. Do NOT create a new interaction."
        )
        system_content = SYSTEM_PROMPT + session_context
    else:
        system_content = SYSTEM_PROMPT


    # ── Invoke LLM ────────────────────────────────────────────────────────────
    response = llm_with_tools.invoke(
        [
            SystemMessage(content=system_content),
            *cleaned_messages,
        ],
        config=config,
    )

    return {
        "messages": [response],
        "interaction_data": interaction_data,
        "interaction_id": interaction_id or active_id,
    }