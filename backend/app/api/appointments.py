"""
Appointments API Endpoints.
Lists and schedules product demonstration appointments.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.database.models import Appointment
from app.schemas.schemas import AppointmentResponse, AppointmentCreate

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.get("", response_model=List[AppointmentResponse])
def get_appointments(db: Session = Depends(get_db)):
    """Retrieve all scheduled demo appointments."""
    return db.query(Appointment).order_by(Appointment.created_at.desc()).all()


@router.post("", response_model=AppointmentResponse)
def create_appointment(data: AppointmentCreate, db: Session = Depends(get_db)):
    """Manually create or confirm an appointment."""
    new_appt = Appointment(
        slot=data.slot,
        customer_name=data.customer_name,
        customer_email=data.customer_email,
        notes=data.notes,
        status="confirmed"
    )
    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)
    return new_appt
