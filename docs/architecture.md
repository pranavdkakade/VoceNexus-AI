# VoceNexus AI — System Architecture & Technical Specifications

> Built for the Fortivex AI Autonomous Sales Voice Agent Technical Demonstration.

---

## 1. Executive Summary

**VoceNexus AI** is an enterprise-grade autonomous AI sales voice agent designed to act like a consultative, human sales representative for Fortivex Solutions. 

Unlike conventional chatbots that simply emit static text, VoceNexus operates as an **agentic system**: it actively listens to customer speech, retrieves company knowledge using dense vector search (RAG), scores and qualifies leads using a transparent rubric, executes calendar booking tools, synchronizes data into a relational CRM, and generates executive call summaries with business intelligence metrics.

---

## 2. High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Browser)                         │
│                                                                        │
│   ┌───────────────────┐                  ┌────────────────────────┐    │
│   │  Web Speech API   │─── Speech-to- ──▶│   WebSocket Client     │    │
│   │   (Microphone)    │        Text      │   (Real-Time Stream)   │    │
│   └───────────────────┘                  └───────────┬────────────┘    │
│            ▲                                         │                 │
│            │ Text-to-Speech (TTS)                    │ ws://.../ws/voice
│   ┌────────┴──────────┐                              │                 │
│   │  Voice Visualizer │◀──────── AI Audio ───────────┤                 │
│   │  & Transcript UI  │          Response            │                 │
│   └───────────────────┘                              ▼                 │
└──────────────────────────────────────────────────────┼─────────────────┘
                                                       │
                                  Bidirectional JSON Stream
                                                       │
┌──────────────────────────────────────────────────────▼─────────────────┐
│                     BACKEND LAYER (FastAPI)                            │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    API & WebSocket Routers                       │  │
│  │   /ws/voice       /api/leads       /api/appointments  /analytics │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│  ┌──────────────────────────────────▼───────────────────────────────┐  │
│  │                     AI AGENT ORCHESTRATOR                        │  │
│  │                                                                  │  │
│  │  • Session Memory Manager (Sliding Window Context)               │  │
│  │  • Real-Time Sentiment & Intent Classifier                       │  │
│  │  • Groq LPU Inference Engine (Sub-second latency)                │  │
│  │  • Dynamic Tool Router (RAG, CRM, Booking)                       │  │
│  └──────┬─────────────────┬─────────────────┬────────────────┬──────┘  │
│         │                 │                 │                │         │
│         ▼                 ▼                 ▼                ▼         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │ RAG Service  │  │ Lead Scoring │  │ CRM Tool    │  │ Booking Tool │ │
│  │ FAISS Vector │  │ 0-100 Rubric │  │ Customer &  │  │ Calendar     │ │
│  │ Store        │  │ Engine       │  │ Lead Sync   │  │ Slot Locking │ │
│  └──────────────┘  └──────────────┘  └─────────────┘  └──────────────┘ │
│         │                                                    │         │
│         └───────────────────────┬────────────────────────────┘         │
│                                 ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              PERSISTENCE LAYER (SQLAlchemy + SQLite)             │  │
│  │    customers │ leads │ conversations │ messages │ appointments   │  │
│  │    call_summaries                                                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Architectural Subsystems

### 3.1 Voice & Audio Pipeline
- **Speech-to-Text (STT)**: Utilizes the browser's native `webkitSpeechRecognition` with continuous listening and interim results. This eliminates third-party audio transmission latency and incurs zero per-minute transcription costs.
- **Echo Suppression**: Automatically halts speech recognition listeners while the synthesized voice audio is active, preventing audio loop feedback.
- **Text-to-Speech (TTS)**: Uses `window.speechSynthesis` with dynamic voice selection prioritizing natural English voices (`en-US`), speech rate tuning (1.05x), and conversational pacing.

### 3.2 AI Reasoning Engine & Groq LPU
- Real-time voice agents fail when latency exceeds 1.5 seconds. Traditional GPU cloud providers typically take 2.5–5.0 seconds per conversational response.
- VoceNexus uses **Groq Language Processing Units (LPUs)** running `openai/gpt-oss-20b`, delivering **0.771-second response latency**.
- Voice-Optimized Prompting: The system prompt instructs the agent to avoid bullet points, asterisks, markdown headers, and emoji characters that degrade Text-to-Speech quality.

### 3.3 Retrieval-Augmented Generation (RAG)
- **Knowledge Ingestion**: Enterprise documentation (`company_info.txt`) detailing Fortivex solutions, pricing tiers ($499 to $4,500/mo), security certifications (SOC2 Type II, GDPR), and FAQs is chunked into 400-character segments with 50-character overlap.
- **Dense Vector Search**: Embedded using `sentence-transformers/all-MiniLM-L6-v2` into an optimized local **FAISS** index.
- **Context Injection**: Relevant document facts are dynamically queried and provided as verified ground-truth context whenever pricing, products, or technical capabilities are discussed.

### 3.4 Lead Qualification & Scoring Engine
Lead qualification does not rely on subjective LLM guesswork. It executes an explainable 0–100 point rubric:
- **Business Profile (20 pts)**: Industry and business model identified (e.g. E-Commerce, B2B SaaS).
- **Requirements & Pain Points (25 pts)**: High-value pain points articulated (support automation, order management).
- **Budget & Volume (20 pts)**: Purchase budget or order volume discussed.
- **Urgency & Timeline (15 pts)**: Purchase readiness within the upcoming quarter/month.
- **Positive Sentiment (10 pts)**: High engagement and affirmative buyer attitude.
- **Direct Contact Info (10 pts)**: Email, phone, or corporate contact captured.

---

## 4. Scalability Blueprint for 100,000 Concurrent Users

While this prototype runs on a single node for demonstration purposes, it is architecturally designed to scale seamlessly to **100,000 concurrent users** using modern cloud-native infrastructure:

```
                              ┌───────────────────┐
                              │  Cloudflare Edge  │ (Static Frontend CDN & DDoS Shield)
                              └─────────┬─────────┘
                                        │
                              ┌─────────▼─────────┐
                              │ AWS ALB / Nginx   │ (SSL Termination & WSS Load Balancing)
                              └─────────┬─────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
     ┌─────▼──────┐               ┌─────▼──────┐               ┌─────▼──────┐
     │ FastAPI    │               │ FastAPI    │               │ FastAPI    │
     │ Pod 1      │               │ Pod 2      │               │ Pod N      │
     └─────┬──────┘               └─────┬──────┘               └─────┬──────┘
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
     ┌───────────────────────┐                     ┌───────────────────────┐
     │  Redis Cluster        │                     │ PostgreSQL Primary    │
     │  - Session State      │                     │ + Read Replicas       │
     │  - Rate Limiting      │                     │ + pgBouncer Pooling   │
     │  - Pub/Sub Channel    │                     └───────────────────────┘
     └───────────┬───────────┘
                 │
     ┌───────────▼───────────┐
     │ Celery Worker Pool    │ (Async post-call summarization & CRM webhooks)
     └───────────────────────┘
```

### Key Scaling Strategies:

1. **Horizontal Backend Scaling (FastAPI on Kubernetes)**
   - FastAPI is natively asynchronous (`async`/`await`). A single instance handles 2,000–5,000 concurrent WebSocket connections.
   - 25–40 auto-scaled Kubernetes pods behind an AWS Application Load Balancer can easily service 100,000 concurrent voice sessions.

2. **Decoupled Session State (Redis Cluster)**
   - In-memory conversation history is migrated from local Python memory to a distributed Redis cache using session keys with automatic TTL expiration.

3. **High-Performance Database Layer**
   - Migrate from SQLite to **PostgreSQL** with **pgBouncer** connection pooling.
   - Master/Replica architecture: Write operations (customer creation, booking) target the Primary node; read-heavy dashboard queries target read replicas.

4. **Asynchronous Background Processing (Celery + Redis)**
   - Post-call summarization and CRM webhook syncs are offloaded to background Celery workers so that call teardown never blocks the WebSocket event loop.

5. **Distributed Vector Database**
   - Replace single-node FAISS with a managed vector database (e.g. Pinecone, Qdrant, or Weaviate) with horizontal sharding for sub-10ms knowledge retrieval.

6. **Enterprise Security & Compliance**
   - TLS 1.3 encryption for all data in transit; AES-256 for data at rest.
   - JWT session tokens for authenticated WebSocket handshakes.
   - Token-bucket rate limiting per IP to mitigate abuse.
