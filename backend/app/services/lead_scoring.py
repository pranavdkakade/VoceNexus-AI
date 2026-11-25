"""
Lead Qualification & Scoring Service.
Computes a rigorous, explainable 0–100 lead score based on:
- Business profile identified (20 pts)
- Clear pain points / requirements (25 pts)
- Budget indicator or team size (20 pts)
- Timeline / Urgency (15 pts)
- Positive sentiment & responsiveness (10 pts)
- Contact information captured (10 pts)
"""

from typing import Dict, Any, List
import re


def score_lead_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates extracted prospect data and calculates qualification score.
    """
    score = 0
    breakdown = []

    # 1. Business Profile (+20)
    business_type = data.get("business_type", "").strip()
    if business_type and business_type.lower() not in ["none", "unknown", ""]:
        score += 20
        breakdown.append("Business type identified (+20)")

    # 2. Requirements & Pain points (+25)
    requirements = data.get("requirements", [])
    if requirements and len(requirements) > 0:
        score += 25
        breakdown.append(f"Identified {len(requirements)} specific requirements (+25)")

    # 3. Budget / Volume (+20)
    budget = str(data.get("budget", "")).strip().lower()
    if any(k in budget for k in ["$", "k", "month", "budget", "tier", "growth", "enterprise", "1000", "5000"]):
        score += 20
        breakdown.append("Budget / Volume discussed (+20)")

    # 4. Timeline / Urgency (+15)
    timeline = str(data.get("timeline", "")).strip().lower()
    if any(t in timeline for t in ["now", "immediate", "asap", "month", "week", "tomorrow", "quarter", "ready"]):
        score += 15
        breakdown.append("High urgency purchase timeline (+15)")

    # 5. Sentiment (+10)
    sentiment = data.get("sentiment", "neutral")
    if sentiment == "positive":
        score += 10
        breakdown.append("Positive buyer sentiment (+10)")

    # 6. Contact info (+10)
    email = data.get("email", "")
    phone = data.get("phone", "")
    if email or phone:
        score += 10
        breakdown.append("Direct contact details collected (+10)")

    # Status classification
    if score >= 70:
        status = "qualified"
        next_action = "book_demo"
    elif score >= 40:
        status = "warm"
        next_action = "qualify_budget_timeline"
    else:
        status = "nurture"
        next_action = "discover_requirements"

    return {
        "lead_score": score,
        "lead_status": status,
        "business_type": business_type or "General Enterprise",
        "requirements": requirements,
        "sentiment": sentiment,
        "next_action": next_action,
        "scoring_breakdown": breakdown
    }
