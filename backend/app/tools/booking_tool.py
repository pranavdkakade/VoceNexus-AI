"""
Calendar & Appointment Booking Tool.
Checks available demo slots and schedules appointments in the database.
"""

from typing import Dict, Any, List
import uuid
import datetime
from app.database.connection import SessionLocal
from app.database.models import Appointment

AVAILABLE_SLOTS = [
    "Tomorrow at 10:00 AM",
    "Tomorrow at 11:30 AM",
    "Tomorrow at 2:00 PM",
    "Tomorrow at 4:30 PM",
    "Thursday at 11:00 AM",
    "Thursday at 3:00 PM",
    "Friday at 10:00 AM"
]


def check_available_slots() -> List[str]:
    """Returns upcoming available demo appointment slots."""
    return AVAILABLE_SLOTS[:4]


def book_demo_appointment(
    slot: str,
    customer_name: str = "Prospect",
    customer_email: str = "",
    notes: str = ""
) -> Dict[str, Any]:
    """Locks in an appointment and saves it into the database."""
    db = SessionLocal()
    try:
        appt_id = f"APPT-{str(uuid.uuid4())[:6].upper()}"
        new_appt = Appointment(
            id=appt_id,
            slot=slot,
            customer_name=customer_name or "Prospect",
            customer_email=customer_email,
            notes=notes,
            status="confirmed"
        )
        db.add(new_appt)
        db.commit()
        db.refresh(new_appt)

        return {
            "status": "confirmed",
            "appointment_id": new_appt.id,
            "slot": slot,
            "message": f"Demonstration successfully booked for {slot}."
        }
    except Exception as e:
        db.rollback()
        return {"status": "error", "error": str(e)}
    finally:
        db.close()
