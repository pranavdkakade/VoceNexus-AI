"""
Analytics & Post-Call Summaries API.
Provides executive dashboard metrics, conversion ratios, and recent call reports.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database.connection import get_db
from app.database.models import Lead, Appointment, Conversation, CallSummary
from app.schemas.schemas import CallSummaryResponse, AnalyticsOverview

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    """Computes high-level sales KPI metrics for the dashboard."""
    total_calls = db.query(Conversation).count()
    total_leads = db.query(Lead).count()
    qualified_leads = db.query(Lead).filter(Lead.lead_score >= 60).count()
    total_appointments = db.query(Appointment).count()

    leads = db.query(Lead).all()
    avg_score = 0.0
    if leads:
        avg_score = round(sum(l.lead_score for l in leads) / len(leads), 1)

    # Sentiment distribution
    summaries = db.query(CallSummary).all()
    pos = sum(1 for s in summaries if s.sentiment_overall == "positive")
    neu = sum(1 for s in summaries if s.sentiment_overall == "neutral")
    neg = sum(1 for s in summaries if s.sentiment_overall == "negative")

    # If no calls yet, provide sensible default distribution
    if not summaries and total_leads > 0:
        pos = total_leads
        neu = 0
        neg = 0

    return {
        "total_calls": max(total_calls, total_leads),
        "total_leads": total_leads,
        "qualified_leads": qualified_leads,
        "total_appointments": total_appointments,
        "avg_lead_score": avg_score,
        "sentiment_distribution": {
            "positive": pos,
            "neutral": neu,
            "negative": neg
        }
    }


@router.get("/summaries", response_model=List[CallSummaryResponse])
def get_recent_summaries(db: Session = Depends(get_db)):
    """Returns recent AI-generated call summaries."""
    return db.query(CallSummary).order_by(CallSummary.created_at.desc()).limit(20).all()
