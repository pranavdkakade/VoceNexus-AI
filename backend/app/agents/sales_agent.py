"""
Autonomous AI Sales Agent powered by Groq LLM & Tool Execution Orchestrator.
Combines RAG Knowledge Retrieval, Lead Qualification, CRM Updates, and Demo Booking.
"""

import os
import json
import re
from typing import Dict, Any, List, Optional
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

        # 2. Extract Lead & Customer Signals across full dialogue
        lead_signals = self._extract_signals(user_message, history, sentiment)
        lead_analysis = score_lead_data(lead_signals)

        # 3. Autonomous Booking: Check if appointment requested or confirmed
        booking_result = self._handle_booking_intent(user_message, history, session_id, lead_signals)

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

        if any(w in user_message.lower() for w in ["demo", "schedule", "book", "meeting", "time", "slot", "when"]):
            system_content += f"\nUpcoming Available Demo Slots: {', '.join(available_slots)}. If the prospect agrees to a slot or states a day/time, confirm it warmly."

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

            # Clean response of markdown headers or bullet stars for clean TTS speech
            assistant_response = re.sub(r"[\*#_`]", "", assistant_response)

            # Record agent response in session memory
            memory.add_message(session_id, "assistant", assistant_response)

            # 6. Autonomous CRM Sync: save lead if score >= 30
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
        all_user_turns = [m["content"] for m in history if m["role"] == "user"] + [text]
        full_text = " ".join(all_user_turns)
        lower = full_text.lower()

        # Business type extraction
        business_type = ""
        if "e-commerce" in lower or "ecommerce" in lower or "shopify" in lower or "store" in lower or "commerce" in lower:
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
        match_budget = re.search(r"(\$?\d+[\d,]*\s*(k|thousand|month|\/mo)?)", full_text, re.IGNORECASE)
        if match_budget:
            budget = match_budget.group(1)

        # Contact info: Email
        email = ""
        # Search for standard email pattern
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", full_text)
        if email_match:
            email = email_match.group(0)
        else:
            # Handle spaced-out speech transcription like "p r a n a v @ gmail . com"
            spaced_match = re.search(r"([a-zA-Z0-9\s\.\-_]+)\s*@\s*([a-zA-Z0-9\s\-_]+)\s*\.\s*(com|net|org|io|in|co)", full_text, re.IGNORECASE)
            if spaced_match:
                local_part = spaced_match.group(1).replace(" ", "")
                domain_part = spaced_match.group(2).replace(" ", "")
                ext = spaced_match.group(3).replace(" ", "")
                email = f"{local_part}@{domain_part}.{ext}"

        # Contact info: Name
        name = ""
        name_match = re.search(r"(?:my name is|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)", full_text, re.IGNORECASE)
        if name_match:
            name = name_match.group(1).strip()

        # Company name
        company = ""
        comp_match = re.search(r"(?:my company name is|company name is|company is)\s+([a-zA-Z0-9\-_]+)", full_text, re.IGNORECASE)
        if comp_match:
            company = comp_match.group(1).strip()

        if email or name or company:
            save_customer_info(name=name or "Prospect", email=email, company=company)

        return {
            "business_type": business_type,
            "requirements": requirements,
            "budget": budget,
            "name": name,
            "email": email,
            "company": company,
            "sentiment": sentiment
        }

    def _handle_booking_intent(
        self,
        text: str,
        history: List[Dict[str, str]],
        session_id: str,
        lead_signals: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Intelligently detects when a prospect agrees to or specifies a demo slot.
        Extracts day, time, and customer details dynamically.
        """
        # Normalize text and recent turns
        norm_text = text.lower().replace("p.m.", "pm").replace("a.m.", "am").replace(".", "")
        all_recent = " ".join([m["content"].lower() for m in history[-3:]]) + " " + norm_text

        # 1. Day of week detection
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "tomorrow", "today"]
        found_day = ""
        for d in days:
            if d in norm_text:
                found_day = d.capitalize()
                break

        # 2. Time detection (e.g. "2:00 pm", "2 pm", "11:30 am", "11 am", "4 o'clock")
        time_match = re.search(r"(\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b|\b\d{1,2}\s*(?:o'clock)?\s*(?:in the afternoon|in the morning)?\b)", norm_text)
        found_time = ""
        if time_match:
            found_time = time_match.group(1).upper()
            # If plain number like "2" was mentioned alongside "pm"
            if not ("AM" in found_time or "PM" in found_time):
                if "pm" in norm_text or "afternoon" in norm_text or "evening" in norm_text:
                    found_time += " PM"
                else:
                    found_time += " AM"

        # 3. Agreement / Scheduling intention words
        intent_keywords = [
            "schedule", "book", "demo", "appointment", "slot", "meeting",
            "works for me", "works", "lock in", "confirm", "timing", "sounds good",
            "yes", "sure", "fine", "let's do"
        ]
        has_intent = any(w in norm_text for w in intent_keywords)

        # If a day or time is provided, or user is confirming a proposed slot
        if (found_day or found_time) or (has_intent and any(d in all_recent for d in days)):
            # Compose the readable slot string
            if found_day and found_time:
                slot = f"{found_day} at {found_time}"
            elif found_day:
                slot = f"{found_day} at 11:00 AM"
            elif found_time:
                slot = f"Tomorrow at {found_time}"
            else:
                slot = "Tomorrow at 11:00 AM"

            customer_name = lead_signals.get("name") or "Prospect"
            customer_email = lead_signals.get("email") or ""
            company = lead_signals.get("company") or ""

            return book_demo_appointment(
                slot=slot,
                customer_name=customer_name,
                customer_email=customer_email,
                notes=f"Scheduled during call session {session_id} for {company or 'Customer'}."
            )

        return None


# Singleton instance
sales_agent = SalesAgent()
