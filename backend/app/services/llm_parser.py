import json

from app.langgraph.llm import llm
from app.schemas.ai import InteractionExtraction
from app.langgraph.prompts import EXTRACTION_PROMPT


def extract_interaction(text: str):
    response = llm.invoke(
        EXTRACTION_PROMPT + "\n\n" + text
    )

    content = response.content.strip()

    if content.startswith("```"):
        content = content.replace("```json", "")
        content = content.replace("```", "")
        content = content.strip()

    data = json.loads(content)

    validated = InteractionExtraction.model_validate(data)

    return validated.model_dump()