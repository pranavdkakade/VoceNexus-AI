# VoceNexus AI — Autonomous AI Sales Voice Agent

An intelligent, voice-powered AI sales agent that qualifies leads, retrieves company knowledge via RAG, books appointments, and generates business insights — all through natural voice conversation.

## 🎯 What It Does

| Feature | Description |
|---------|-------------|
| 🎤 Voice Conversation | Real-time speech-to-text and text-to-speech via browser |
| 🧠 AI Sales Agent | Groq LLM with autonomous tool-calling (agentic AI) |
| 📚 RAG Knowledge Base | FAISS + Sentence Transformers for company document retrieval |
| 📊 Lead Qualification | Rule-based scoring (0–100) with structured output |
| 😊 Sentiment Analysis | Real-time customer sentiment detection |
| 📅 Appointment Booking | Automated demo scheduling |
| 💾 CRM Integration | Customer & lead data saved to database |
| 📝 Call Summaries | Auto-generated conversation reports with insights |
| 📈 Analytics Dashboard | Visual overview of leads, calls, and appointments |

## 🏗️ Architecture

```
Browser (React + Vite)
  ├── Web Speech API (STT/TTS)
  └── WebSocket Client
         │
         ▼
FastAPI Backend
  ├── AI Agent Orchestrator (Groq LLM + Tool Calling)
  ├── RAG Service (FAISS + Sentence Transformers)
  ├── Lead Scoring & Sentiment Analysis
  ├── CRM & Booking Tools
  └── SQLite Database
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React + Vite |
| Backend | Python + FastAPI |
| LLM | Groq API (Llama 3.1) |
| STT / TTS | Web Speech API (browser-native) |
| RAG | LangChain + FAISS |
| Embeddings | Sentence Transformers (all-MiniLM-L6-v2) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Real-time | WebSocket |
| Validation | Pydantic v2 |
| Deployment | Docker |

## 📁 Project Structure

```
VoceNexus AI/
├── frontend/               # React + Vite voice interface
│   ├── src/
│   │   ├── components/     # VoiceAgent, Conversation, Dashboard
│   │   └── services/       # WebSocket client, API calls
│   └── public/
├── backend/                # FastAPI + AI Agent
│   ├── app/
│   │   ├── api/            # WebSocket & REST endpoints
│   │   ├── agents/         # Sales agent, memory, prompts
│   │   ├── services/       # RAG, sentiment, lead scoring
│   │   ├── tools/          # CRM tool, booking tool
│   │   ├── database/       # SQLAlchemy models
│   │   └── schemas/        # Pydantic models
│   └── knowledge_base/     # Company docs + FAISS index
├── docs/                   # Architecture documentation
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Add your GROQ_API_KEY
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in Chrome and click the microphone to start talking.

## 🔑 Environment Variables

Create `backend/.env`:
```
GROQ_API_KEY=gsk_your_key_here
DATABASE_URL=sqlite:///./voicenexus.db
```

## 📊 Database Schema

- **customers** — Name, email, phone, company
- **leads** — Business type, requirements, score (0–100), status
- **conversations** — Session tracking
- **messages** — Full conversation history
- **appointments** — Scheduled demos with status
- **call_summaries** — AI-generated summaries with sentiment

## 🏢 Built For

**Fortivex AI** — Round 3 Technical Assessment: Autonomous AI Sales Voice Agent

## 📄 License

MIT
