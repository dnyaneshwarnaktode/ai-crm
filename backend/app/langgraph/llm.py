from langchain_groq import ChatGroq
from app.core.config import GROQ_API_KEY


llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model="qwen/qwen3.6-27b",
    temperature=0.1,
)