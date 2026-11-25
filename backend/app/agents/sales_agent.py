"""
Autonomous AI Sales Agent powered by Groq LLM & Tool Execution Orchestrator.
Combines RAG Knowledge Retrieval, Lead Qualification, CRM Updates, and Demo Booking.
"""

import os
import json
import re
from typing import Dict, Any, List
from groq import Groq
from dotenv import load_dotenv

from app.agents.prompts import SALES_AGENT_SYSTEM_PROMPT
from app.agents.memory import memory
from app.services.rag import rag_service
from app.services.sentiment import analyze_sentiment_fast
from app.services.lead_scoring import score_lead_data
from app.tools.crm_tool import save_customer_info, save_lead_qualification
from app.tools.booking_tool import check_available_slots, book_demo_appointment

load_dotenv()


class SalesAgent:
    def __init__(self, model: str = "openai/gpt-oss-20b"):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not set in environment or .env")
        self.client = Groq(api_key=self.api_key)
        self.model = model

    def process_message(self, session_id: str, user_message: str) -> Dict[str, Any]:
        """
        Processes a user turn:
        1. Analyzes sentiment and extracts intent signals.
        2. Retrieves company knowledge via RAG when relevant.
        3. Executes autonomous actions (CRM lead scoring, appointment booking).
        4. Queries Groq LLM with context for conversational voice response.
        5. Returns response text + lead/appointment metadata.
        """
        # Save user turn into memory
        memory.add_message(session_id, "user", user_message)
        history = memory.get_history(session_id)

        # 1. Sentiment Analysis
        sentiment_data = analyze_sentiment_fast(user_message)
        sentiment = sentiment_data["sentiment"]

        # 2. Extract Lead Signals (Regex / Keyword heuristic)
        lead_signals = self._extract_signals(user_message, history, sentiment)
        lead_analysis = score_lead_data(lead_signals)

        # 3. Autonomous Action: Check if demo requested or booked
        booking_result = self._handle_booking_intent(user_message, session_id)

        # 4. RAG Retrieval: Check if query relates to Fortivex products, pricing, or capabilities
        rag_context = ""
        rag_keywords = [
            "price", "pricing", "cost", "tier", "plan", "product", "support",
            "voice", "agent", "crm", "hubspot", "salesforce", "shopify",
            "security", "soc2", "gdpr", "sla", "minute", "gtm", "feature"
        ]
        if any(k in user_message.lower() for k in rag_keywords):
            rag_docs = rag_service.search(user_message, top_k=2)
            if rag_docs:
                rag_context = "\n\nRelevant Fortivex Knowledge Base Facts:\n" + "\n---\n".join(
                    [d["content"] for d in rag_docs]
                )

        # 5. Build dynamic system prompt with RAG context and booking slots
        available_slots = check_available_slots()
        system_content = SALES_AGENT_SYSTEM_PROMPT
        if rag_context:
            system_content += f"\n{rag_context}\nUse the factual company information above to answer accurately."

        if "demo" in user_message.lower() or "schedule" in user_message.lower() or "book" in user_message.lower():
            system_content += f"\nUpcoming Available Demo Slots: {', '.join(available_slots)}. Offer one or two of these slots to the prospect."

        messages: List[Dict[str, str]] = [
            {"role": "system", "content": system_content}
        ]
        messages.extend(history)

        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=220,
            )

            assistant_response = completion.choices[0].message.content.strip()

            # Clean response of markdown headers or bullet stars for voice TTS cleanliness
            assistant_response = re.sub(r"[\*#_`]", "", assistant_response)

            # Record agent response in session memory
            memory.add_message(session_id, "assistant", assistant_response)

            # 6. Autonomous CRM Sync: save lead if score > 30
            if lead_analysis["lead_score"] >= 30:
                save_lead_qualification(
                    customer_id=session_id,
                    business_type=lead_analysis["business_type"],
                    requirements=lead_analysis["requirements"],
                    budget=lead_signals.get("budget", ""),
                    score=lead_analysis["lead_score"],
                    status=lead_analysis["lead_status"]
                )

            return {
                "response": assistant_response,
                "session_id": session_id,
                "status": "success",
                "lead_score": lead_analysis["lead_score"],
                "lead_status": lead_analysis["lead_status"],
                "sentiment": sentiment,
                "next_action": lead_analysis["next_action"],
                "appointment": booking_result
            }

        except Exception as e:
            fallback = (
                "I apologize, I experienced a brief audio glitch. "
                "Could you please repeat your last requirement?"
            )
            return {
                "response": fallback,
                "session_id": session_id,
                "status": "error",
                "error": str(e),
                "lead_score": lead_analysis["lead_score"],
                "sentiment": sentiment
            }

    def _extract_signals(self, text: str, history: List[Dict[str, str]], sentiment: str) -> Dict[str, Any]:
        """Extracts customer signals from dialogue turns."""
        full_text = " ".join([m["content"] for m in history]) + " " + text
        lower = full_text.lower()

        # Business type extraction
        business_type = ""
        if "e-commerce" in lower or "ecommerce" in lower or "shopify" in lower or "store" in lower:
            business_type = "E-Commerce / Retail"
        elif "saas" in lower or "software" in lower or "tech" in lower:
            business_type = "B2B SaaS"
        elif "healthcare" in lower or "clinic" in lower or "medical" in lower:
            business_type = "Healthcare"
        elif "finance" in lower or "fintech" in lower or "banking" in lower:
            business_type = "Fintech / Financial Services"
        elif "logistics" in lower or "supply chain" in lower:
            business_type = "Logistics & Supply Chain"

        # Requirements extraction
        requirements = []
        if "support" in lower or "customer service" in lower or "tickets" in lower:
            requirements.append("Customer Support Automation")
        if "order" in lower or "returns" in lower or "refund" in lower:
            requirements.append("Order & Returns Management")
        if "inbound" in lower or "lead" in lower or "sales" in lower or "qualification" in lower:
            requirements.append("Inbound Sales Voice Agent")
        if "booking" in lower or "demo" in lower or "appointment" in lower or "calendar" in lower:
            requirements.append("Automated Demo Booking")

        # Budget extraction
        budget = ""
        match_budget = re.search(r"(\$?\d+[\d,]*\s*(k|thousand|month|\/mo)?)", text, re.IGNORECASE)
        if match_budget:
            budget = match_budget.group(1)

        # Contact info
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
        email = email_match.group(0) if email_match else ""

        if email:
            save_customer_info(email=email)

        return {
            "business_type": business_type,
            "requirements": requirements,
            "budget": budget,
            "email": email,
            "sentiment": sentiment
        }

    def _handle_booking_intent(self, text: str, session_id: str) -> Any:
        """Detects if prospect confirms a specific demo slot."""
        lower = text.lower()
        if any(w in lower for w in ["tomorrow", "11 am", "10 am", "2 pm", "thursday", "friday", "works for me", "confirm", "lock in"]):
            if any(k in lower for k in ["tomorrow at 11:30 am", "11:30 am", "11:30", "11 am", "11"]):
                slot = "Tomorrow at 11:00 AM"
            elif "2 pm" in lower or "2:00" in lower:
                slot = "Tomorrow at 2:00 PM"
            elif "10 am" in lower or "10:00" in lower:
                slot = "Tomorrow at 10:00 AM"
            else:
                slot = "Tomorrow at 11:00 AM"

            return book_demo_appointment(
                slot=slot,
                customer_name="Prospect",
                notes=f"Scheduled during call session {session_id}"
            )
        return None


# Singleton instance
sales_agent = SalesAgent()
