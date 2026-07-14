import json

from app.langgraph.llm import llm
from app.schemas.ai import InteractionExtraction
from app.langgraph.prompts import EXTRACTION_PROMPT


def extract_interaction(text: str):
    # Enforce structured output matching the Pydantic schema directly via the LLM API
    structured_llm = llm.with_structured_output(InteractionExtraction)
    
    # Use a simple prompt. The schema structure is already bound, so we don't need JSON formatting instructions.
    validated = structured_llm.invoke(
        f"Extract interaction details from the following user description:\n\n{text}"
    )

    return validated.model_dump()