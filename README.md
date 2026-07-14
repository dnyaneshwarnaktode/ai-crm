# AI CRM — HCP Interaction Logger

> An AI-First CRM application for pharmaceutical representatives to log and manage Healthcare Professional (HCP) interactions using natural language, powered by LangGraph, LangChain, and Groq.

---

## ✨ Features

- 💬 **Natural Language Logging** — Describe your HCP meeting in plain English; the AI extracts and structures all the data automatically
- 🤖 **LangGraph Agent** — Multi-step AI pipeline with 5 specialized tools
- 📋 **Auto-Populated Form** — Left panel updates in real-time from AI responses (read-only, never manually editable)
- 🗄️ **PostgreSQL Persistence** — Every interaction, HCP, product, and chat message is saved to the database
- 🔄 **Session Continuity** — Edit previous interactions by referencing the session ID
- ⚡ **Groq Inference** — Ultra-fast LLM inference using `llama-3.3-70b-versatile`

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 |
| **State** | Redux Toolkit |
| **HTTP** | Axios |
| **Backend** | FastAPI + Uvicorn |
| **Database** | PostgreSQL + SQLAlchemy 2 |
| **AI Runtime** | LangGraph + LangChain |
| **LLM** | Groq (`llama-3.3-70b-versatile`) |

---

## 🤖 AI Tools

The LangGraph agent has access to 5 tools:

| Tool | Description |
|------|-------------|
| `log_interaction` | Extracts structured data and saves a new HCP interaction to the DB |
| `edit_interaction` | Updates an existing interaction record in the DB |
| `extract_products` | Identifies pharmaceutical products mentioned in the text |
| `analyze_sentiment` | Determines the HCP's sentiment (Positive / Negative / Neutral) |
| `suggest_follow_up` | Generates a follow-up recommendation based on the interaction summary |

---

## 🗂️ Project Structure

```
ai-crm/
├── backend/
│   ├── app/
│   │   ├── core/            # Config, database session
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   ├── crud/            # DB query functions
│   │   ├── services/        # Business logic layer
│   │   ├── routers/         # FastAPI route handlers
│   │   ├── langgraph/       # LangGraph agent, graph, nodes, tools
│   │   └── main.py          # FastAPI app entry point
│   ├── .env
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/      # InteractionForm, ChatPanel, MessageBubble
    │   ├── store/           # Redux slices (chat, interaction) + hooks
    │   ├── services/        # Axios API client
    │   ├── types.ts         # Shared TypeScript types
    │   ├── App.tsx          # Split-screen layout
    │   └── main.tsx         # Redux Provider entry point
    ├── index.html
    └── vite.config.ts
```

---

## 🚀 Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL running locally
- Groq API key → [console.groq.com](https://console.groq.com)

---

### 1. Clone the repo

```bash
git clone https://github.com/your-username/ai-crm.git
cd ai-crm
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Edit `.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://your_user@localhost:5432/ai_crm
```

Create the PostgreSQL database:

```bash
createdb ai_crm
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat/` | Send message to AI assistant |
| `GET` | `/chat/history/{id}` | Get chat history for an interaction |
| `GET` | `/interactions/` | List all interactions |
| `GET` | `/interactions/{id}` | Get a single interaction with full details |
| `GET` | `/hcp/` | List all HCPs |
| `POST` | `/hcp/` | Create a new HCP |

### Example Request

```bash
curl -X POST http://localhost:8000/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Today I met Dr Smith. Discussed Ozempic. Doctor liked it."}'
```

### Example Response

```json
{
  "success": true,
  "assistant_message": "Interaction logged successfully.",
  "interaction_data": {
    "hcp_name": "Dr Smith",
    "interaction_type": null,
    "interaction_date": "2026-07-14",
    "interaction_time": null,
    "attendees": null,
    "topics_discussed": "Ozempic",
    "summary": "Doctor liked it.",
    "products": ["Ozempic"],
    "materials_shared": [],
    "samples_distributed": [],
    "sentiment": "Positive",
    "outcomes": null,
    "follow_up": null
  },
  "interaction_id": 1
}
```

---

## 🗄️ Database Schema

```
hcp                    interaction
─────────────          ─────────────────────
id (PK)                id (PK)
name                   hcp_id (FK → hcp.id)
specialization         interaction_type
hospital               interaction_date
city                   interaction_time
email                  attendees
phone                  topics_discussed
                       summary
                       sentiment
                       outcomes
                       follow_up

product                interaction_product    chat_history
────────               ─────────────────────  ─────────────
id (PK)                id (PK)               id (PK)
product_name           interaction_id (FK)   interaction_id (FK)
category               product_id (FK)       role
description                                  message
                                             created_at
```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq API key | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |

---

## 🚢 Deployment

### Recommended Stack

| Service | Provider |
|---------|----------|
| **Frontend** | [Vercel](https://vercel.com) |
| **Backend** | [Railway](https://railway.app) or [Render](https://render.com) |
| **Database** | [Neon](https://neon.tech) or [Supabase](https://supabase.com) (free PostgreSQL) |

### Frontend → Vercel

```bash
cd frontend
npm run build        # Build production bundle
```

Then connect your GitHub repo to Vercel and set:
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Root directory**: `frontend`

Update `vite.config.ts` proxy target to your deployed backend URL in production.

### Backend → Railway

1. Push code to GitHub
2. Create a new Railway project → Deploy from GitHub
3. Set root directory to `backend/`
4. Add environment variables: `GROQ_API_KEY`, `DATABASE_URL`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Database → Neon (Free PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Set as `DATABASE_URL` in your backend environment

---

## 🧠 How It Works

```
User types a message
        │
        ▼
POST /chat/ (FastAPI)
        │
        ▼
ChatService.process_message()
  ├── Save user message → ChatHistory table
  ├── invoke_agent(message, db=session)
  │         │
  │         ▼
  │   LangGraph StateGraph
  │   ┌─────────────────────────────────┐
  │   │  START → assistant node         │
  │   │     └── LLM decides which tool  │
  │   │     ├── log_interaction         │
  │   │     ├── edit_interaction        │
  │   │     ├── extract_products        │
  │   │     ├── analyze_sentiment       │
  │   │     └── suggest_follow_up       │
  │   │  tool node → assistant node     │
  │   │  (loop until no more tools)     │
  │   │  → END                          │
  │   └─────────────────────────────────┘
  │
  ├── Save assistant reply → ChatHistory table
  └── Return { success, assistant_message, interaction_data, interaction_id }
        │
        ▼
Redux dispatches setInteractionData()
        │
        ▼
InteractionForm re-renders with new data (read-only)
```

---

## 📋 Example Conversations

**Logging an interaction:**
> "Today I met Dr Patel at City Hospital. We discussed Metformin and Ozempic for diabetic patients. Doctor was very positive about Ozempic's results."

**Editing an interaction:**
> "Actually update the sentiment to neutral for interaction #3"

**Asking for a follow-up:**
> "What follow-up should I do after the meeting with Dr Patel?"

**Product extraction:**
> "Which products were discussed in our last meeting?"

---

## 📄 License

MIT License — feel free to use this project for learning or as a base for production applications.
