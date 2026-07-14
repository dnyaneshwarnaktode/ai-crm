from app.services.llm_parser import extract_interaction


class AIService:

    def extract(self, text: str):

        return extract_interaction(text)