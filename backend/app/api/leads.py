"""
Leads API Endpoints.
CRUD operations and filtering for CRM sales leads.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.database.models import Lead
from app.schemas.schemas import LeadResponse

router = APIRouter(prefix="/api/leads", tags=["Leads"])


@router.get("", response_model=List[LeadResponse])
def get_leads(db: Session = Depends(get_db)):
    """Fetch all leads ordered by most recent."""
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()
    return leads


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: str, db: Session = Depends(get_db)):
    """Fetch a specific lead by ID."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead
