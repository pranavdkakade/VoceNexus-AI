"""
VoceNexus AI — FastAPI Application Entry Point
Autonomous AI Sales Voice Agent
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.database.connection import engine, Base
from app.database.models import Customer, Lead, Conversation, Message, Appointment, CallSummary

# Load environment variables
load_dotenv()

# Automatically create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="VoceNexus AI",
    description="Autonomous AI Sales Voice Agent — Qualifies leads, retrieves company knowledge, books appointments, and generates business insights through voice conversation.",
    version="1.0.0",
)

# CORS — Allow frontend (React on port 5173) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Health Check ----------
@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint — verifies the server is running."""
    return {
        "status": "ok",
        "message": "VoceNexus AI is running",
        "version": "1.0.0",
    }


@app.get("/api/health", tags=["Health"])
async def api_health():
    """API health check with environment status."""
    groq_key = os.getenv("GROQ_API_KEY", "")
    return {
        "status": "ok",
        "groq_configured": bool(groq_key and groq_key != "gsk_your_key_here"),
        "database": os.getenv("DATABASE_URL", "sqlite:///./voicenexus.db"),
    }


# ---------- Register Routers ----------
from app.api.voice import router as voice_router
from app.api.leads import router as leads_router
from app.api.appointments import router as appointments_router
from app.api.analytics import router as analytics_router

app.include_router(voice_router)
app.include_router(leads_router)
app.include_router(appointments_router)
app.include_router(analytics_router)
