"""
CRM Data Management Tool.
Handles customer creation, lead qualification saving, and SQLite database synchronization.
"""

from typing import Dict, Any, List
import uuid
import datetime
from app.database.connection import SessionLocal
from app.database.models import Customer, Lead


def save_customer_info(
    name: str = "",
    email: str = "",
    phone: str = "",
    company: str = ""
) -> Dict[str, Any]:
    """
    Saves or updates customer details in the SQLite database.
    """
    db = SessionLocal()
    try:
        # Check if customer already exists by email
        existing = None
        if email:
            existing = db.query(Customer).filter(Customer.email == email).first()

        if existing:
            if name:
                existing.name = name
            if phone:
                existing.phone = phone
            if company:
                existing.company = company
            db.commit()
            db.refresh(existing)
            customer_id = existing.id
        else:
            new_cust = Customer(
                name=name or "Prospect",
                email=email,
                phone=phone,
                company=company
            )
            db.add(new_cust)
            db.commit()
            db.refresh(new_cust)
            customer_id = new_cust.id

        return {
            "status": "success",
            "customer_id": customer_id,
            "message": f"Customer record saved for {name or email or 'prospect'}."
        }
    except Exception as e:
        db.rollback()
        return {"status": "error", "error": str(e)}
    finally:
        db.close()


def save_lead_qualification(
    customer_id: str = "",
    business_type: str = "",
    requirements: List[str] = None,
    budget: str = "",
    score: int = 75,
    status: str = "qualified"
) -> Dict[str, Any]:
    """
    Saves or updates lead qualification record in the database.
    """
    db = SessionLocal()
    try:
        new_lead = Lead(
            customer_id=customer_id if customer_id and len(customer_id) < 36 else None,
            business_type=business_type or "General Enterprise",
            requirements=requirements or [],
            budget=budget,
            lead_score=score,
            lead_status=status,
            next_action="book_demo" if score >= 60 else "qualify_budget_timeline"
        )
        db.add(new_lead)
        db.commit()
        db.refresh(new_lead)
        return {
            "status": "success",
            "lead_id": new_lead.id,
            "lead_score": score,
            "lead_status": status,
            "message": f"Lead qualified with score {score}/100 ({status})."
        }
    except Exception as e:
        db.rollback()
        return {"status": "error", "error": str(e)}
    finally:
        db.close()
