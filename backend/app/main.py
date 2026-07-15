from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.routers.hcp import router as hcp_router
from app.routers.interaction import router as interaction_router
from app.routers.chat import router as chat_router

# Import all models so SQLAlchemy registers them before create_all
from app.models import (
    HCP,
    Interaction,
    Product,
    InteractionProduct,
    InteractionMaterial,
    InteractionSample,
    ChatHistory,
    AIMetadata,
)

app = FastAPI(
    title="AI CRM Backend",
    version="1.0.0",
    description="AI-First CRM for HCP Interaction Logging",
)

import os

# Read allowed origins from env, fallback to local development URLs
origins_env = os.getenv("CORS_ORIGINS")
if origins_env:
    origins = [origin.strip() for origin in origins_env.split(",")]
else:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(hcp_router)
app.include_router(interaction_router)
app.include_router(chat_router)

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Done creating tables.")

@app.get("/")
def root():
    return {"message": "AI CRM Backend Running 🚀"}