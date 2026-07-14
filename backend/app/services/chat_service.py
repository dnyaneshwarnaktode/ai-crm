"""
ChatService — orchestrates the LangGraph agent and persists chat history.
"""
from __future__ import annotations

import json
from typing import Optional

from sqlalchemy.orm import Session

from app.langgraph.agent import invoke_agent
from app.models.chat_history import ChatHistory


class ChatService:

    def __init__(self, db: Session) -> None:
        self.db = db

    def process_message(self, request) -> dict:
        """
        1. Save user message to ChatHistory.
        2. Invoke LangGraph agent (with DB so tools can persist).
        3. Save assistant reply to ChatHistory.
        4. Return structured response.
        """
        interaction_id: Optional[int] = getattr(request, "interaction_id", None)

        # ── 1. Save user message ──────────────────────────────────────────────
        self._save_chat(
            interaction_id=interaction_id,
            role="user",
            message=request.message,
        )

        # ── 2. Invoke agent ───────────────────────────────────────────────────
        result = invoke_agent(request.message, db=self.db)

        # ── 3. Detect which tools were called ────────────────────────────────
        log_called = False
        edit_called = False
        for msg in result.get("messages", []):
            if msg.type == "tool":
                tool_name = getattr(msg, "name", "") or ""
                if tool_name == "log_interaction":
                    log_called = True
                elif tool_name == "edit_interaction":
                    edit_called = True

        # ── 4. Determine assistant message ───────────────────────────────────
        assistant_message = result["messages"][-1].content
        if log_called:
            assistant_message = "Interaction logged successfully."
        elif edit_called:
            assistant_message = "Interaction updated successfully."

        # ── 5. Extract structured interaction data ───────────────────────────
        raw_data: Optional[dict] = result.get("interaction_data")
        result_interaction_id: Optional[int] = result.get("interaction_id")

        # If log created a new record, pick up the ID from raw_data
        if raw_data and not result_interaction_id:
            result_interaction_id = raw_data.get("interaction_id")

        # Use request's interaction_id as fallback for edit flows
        if not result_interaction_id and interaction_id:
            result_interaction_id = interaction_id

        # Build filtered interaction_data for the response
        interaction_data: Optional[dict] = None
        if raw_data and isinstance(raw_data, dict):
            sentiment = raw_data.get("sentiment")
            if isinstance(sentiment, str):
                sentiment = sentiment.capitalize()
            interaction_data = {
                "hcp_name": raw_data.get("hcp_name"),
                "interaction_type": raw_data.get("interaction_type"),
                "interaction_date": raw_data.get("interaction_date"),
                "interaction_time": raw_data.get("interaction_time"),
                "attendees": raw_data.get("attendees"),
                "topics_discussed": raw_data.get("topics_discussed"),
                "summary": raw_data.get("summary"),
                "products": raw_data.get("products", []),
                "materials_shared": raw_data.get("materials_shared", []),
                "samples_distributed": raw_data.get("samples_distributed", []),
                "sentiment": sentiment,
                "outcomes": raw_data.get("outcomes"),
                "follow_up": raw_data.get("follow_up"),
            }

        # ── 6. Save assistant reply ───────────────────────────────────────────
        self._save_chat(
            interaction_id=result_interaction_id,
            role="assistant",
            message=assistant_message,
        )

        return {
            "success": True,
            "assistant_message": assistant_message,
            "interaction_data": interaction_data,
            "interaction_id": result_interaction_id,
        }

    # ── private ───────────────────────────────────────────────────────────────

    def _save_chat(
        self,
        interaction_id: Optional[int],
        role: str,
        message: str,
    ) -> None:
        """Persist a chat message to the ChatHistory table."""
        try:
            entry = ChatHistory(
                interaction_id=interaction_id,
                role=role,
                message=message,
            )
            self.db.add(entry)
            self.db.commit()
        except Exception:
            self.db.rollback()