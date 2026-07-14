"""
ChatService — orchestrates the LangGraph agent and persists chat history.
"""
from __future__ import annotations

from typing import Optional

from langchain_core.messages import HumanMessage, AIMessage
from sqlalchemy.orm import Session

from app.langgraph.agent import invoke_agent
from app.models.chat_history import ChatHistory


class ChatService:

    def __init__(self, db: Session) -> None:
        self.db = db

    def process_message(self, request) -> dict:
        """
        1. Load prior ChatHistory for this session (gives the agent memory).
        2. Save the user message to ChatHistory.
        3. Invoke LangGraph agent with full history + current message.
        4. Save assistant reply to ChatHistory.
        5. Return structured response.
        """
        interaction_id: Optional[int] = getattr(request, "interaction_id", None)

        # ── 1. Load conversation history ──────────────────────────────────────
        history = self._load_history(interaction_id)

        # ── 2. Save user message ──────────────────────────────────────────────
        self._save_chat(
            interaction_id=interaction_id,
            role="user",
            message=request.message,
        )

        # ── 3. Invoke agent with full history + session ID ────────────────────
        result = invoke_agent(
            user_input=request.message,
            db=self.db,
            history=history,
            interaction_id=interaction_id,
        )

        # ── 4. Detect which tools were called ─────────────────────────────────
        log_called = False
        edit_called = False
        for msg in result.get("messages", []):
            if msg.type == "tool":
                tool_name = getattr(msg, "name", "") or ""
                if tool_name == "log_interaction":
                    log_called = True
                elif tool_name == "edit_interaction":
                    edit_called = True

        # ── 5. Determine assistant message ────────────────────────────────────
        # Use the LLM's conversational response directly (so it can ask for missing fields)
        assistant_message = result["messages"][-1].content
        if not assistant_message:
            if log_called:
                assistant_message = "Interaction logged successfully."
            elif edit_called:
                assistant_message = "Interaction updated successfully."
            else:
                assistant_message = "I have processed your request."

        # ── 6. Extract structured interaction data ────────────────────────────
        raw_data: Optional[dict] = result.get("interaction_data")
        result_interaction_id: Optional[int] = result.get("interaction_id")

        # If log_interaction created a new record, get the ID from raw_data
        if raw_data and not result_interaction_id:
            result_interaction_id = raw_data.get("interaction_id")

        # Fallback: keep the request's interaction_id (edit flows)
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

        # ── 7. Save assistant reply ───────────────────────────────────────────
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

    def _load_history(
        self, interaction_id: Optional[int]
    ) -> list:
        """
        Load previous ChatHistory rows for this interaction and convert them
        to LangChain message objects so the LLM gets conversation context.

        Limits to the last 20 messages to avoid exceeding token limits.
        """
        if not interaction_id:
            return []

        rows = (
            self.db.query(ChatHistory)
            .filter(ChatHistory.interaction_id == interaction_id)
            .order_by(ChatHistory.id.asc())
            .limit(20)
            .all()
        )

        messages = []
        for row in rows:
            if row.role == "user":
                messages.append(HumanMessage(content=row.message))
            elif row.role == "assistant":
                messages.append(AIMessage(content=row.message))
        return messages

    def _save_chat(
        self,
        interaction_id: Optional[int],
        role: str,
        message: str,
    ) -> None:
        """Persist a single chat message to the ChatHistory table."""
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