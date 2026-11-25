"""
CRM Data Management Tool.
Handles customer creation, lead qualification saving, and CRM record sync.
"""

from typing import Dict, Any, List
import uuid
import datetime

# In-memory CRM repository (synchronized to DB in Phase 3)
CUSTOMERS: List[Dict[str, Any]] = []
LEADS: List[Dict[str, Any]] = []


def save_customer_info(
    name: str = "",
    email: str = "",
    phone: str = "",
    company: str = ""
) -> Dict[str, Any]:
    """
    Saves or updates customer details into the CRM.
    """
    customer_id = str(uuid.uuid4())[:8]
    record = {
        "id": customer_id,
        "name": name.strip(),
        "email": email.strip(),
        "phone": phone.strip(),
        "company": company.strip(),
        "created_at": datetime.datetime.now().isoformat()
    }
    CUSTOMERS.append(record)
    return {
        "status": "success",
        "customer_id": customer_id,
        "message": f"Customer record saved for {name or email or 'prospect'}."
    }


def save_lead_qualification(
    customer_id: str = "",
    business_type: str = "",
    requirements: List[str] = None,
    budget: str = "",
    score: int = 75,
    status: str = "qualified"
) -> Dict[str, Any]:
    """
    Saves lead qualification record with score and business criteria.
    """
    lead_id = str(uuid.uuid4())[:8]
    lead_record = {
        "id": lead_id,
        "customer_id": customer_id,
        "business_type": business_type,
        "requirements": requirements or [],
        "budget": budget,
        "lead_score": score,
        "lead_status": status,
        "created_at": datetime.datetime.now().isoformat()
    }
    LEADS.append(lead_record)
    return {
        "status": "success",
        "lead_id": lead_id,
        "lead_score": score,
        "lead_status": status,
        "message": f"Lead qualified with score {score}/100 ({status})."
    }


def get_all_leads() -> List[Dict[str, Any]]:
    return LEADS


def get_all_customers() -> List[Dict[str, Any]]:
    return CUSTOMERS
