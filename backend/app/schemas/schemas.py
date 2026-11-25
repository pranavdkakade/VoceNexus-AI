"""
Pydantic Schemas for Request & Response Validation.
"""

from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime


class CustomerBase(BaseModel):
    name: Optional[str] = "Prospect"
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class LeadResponse(BaseModel):
    id: str
    customer_id: Optional[str] = None
    business_type: str
    requirements: List[str]
    budget: Optional[str] = None
    lead_score: int
    lead_status: str
    next_action: str
    created_at: datetime

    class Config:
        from_attributes = True


class AppointmentCreate(BaseModel):
    slot: str
    customer_name: Optional[str] = "Prospect"
    customer_email: Optional[str] = None
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    slot: str
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CallSummaryResponse(BaseModel):
    id: str
    conversation_id: str
    summary: str
    sentiment_overall: str
    lead_score: int
    key_topics: List[str]
    next_steps: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AnalyticsOverview(BaseModel):
    total_calls: int
    total_leads: int
    qualified_leads: int
    total_appointments: int
    avg_lead_score: float
    sentiment_distribution: dict
