"""
Calendar & Appointment Booking Tool.
Checks available demo slots and schedules appointments with sales engineers.
"""

from typing import Dict, Any, List
import uuid
import datetime

# Mock available upcoming business hour slots
AVAILABLE_SLOTS = [
    "Tomorrow at 10:00 AM",
    "Tomorrow at 11:30 AM",
    "Tomorrow at 2:00 PM",
    "Tomorrow at 4:30 PM",
    "Thursday at 11:00 AM",
    "Thursday at 3:00 PM",
    "Friday at 10:00 AM"
]

BOOKED_APPOINTMENTS: List[Dict[str, Any]] = []


def check_available_slots() -> List[str]:
    """
    Returns upcoming available demo appointment slots.
    """
    return AVAILABLE_SLOTS[:4]


def book_demo_appointment(
    slot: str,
    customer_name: str = "",
    customer_email: str = "",
    notes: str = ""
) -> Dict[str, Any]:
    """
    Locks in an appointment for the prospect and generates a confirmation reference.
    """
    appointment_id = f"APPT-{str(uuid.uuid4())[:6].upper()}"
    appointment = {
        "id": appointment_id,
        "slot": slot,
        "customer_name": customer_name,
        "customer_email": customer_email,
        "notes": notes,
        "status": "confirmed",
        "booked_at": datetime.datetime.now().isoformat()
    }
    BOOKED_APPOINTMENTS.append(appointment)
    return {
        "status": "confirmed",
        "appointment_id": appointment_id,
        "slot": slot,
        "message": f"Demonstration successfully booked for {slot}."
    }


def get_all_appointments() -> List[Dict[str, Any]]:
    return BOOKED_APPOINTMENTS
