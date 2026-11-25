"""
AI Sales Agent powered by Groq LLM.
Handles contextual dialogue, intent detection, and voice-optimized responses.
"""

import os
from typing import Dict, Any, List
from groq import Groq
from dotenv import load_dotenv

from app.agents.prompts import SALES_AGENT_SYSTEM_PROMPT
from app.agents.memory import memory

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
        Process a user speech turn, maintain conversation memory,
        and generate an intelligent sales response.
        """
        # Save user message to memory
        memory.add_message(session_id, "user", user_message)

        # Retrieve prior messages
        history = memory.get_history(session_id)

        # Construct payload with system instructions
        messages: List[Dict[str, str]] = [
            {"role": "system", "content": SALES_AGENT_SYSTEM_PROMPT}
        ]
        messages.extend(history)

        try:
            # Query Groq
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=250,
            )

            assistant_response = completion.choices[0].message.content.strip()

            # Record agent response in memory
            memory.add_message(session_id, "assistant", assistant_response)

            return {
                "response": assistant_response,
                "session_id": session_id,
                "status": "success",
            }

        except Exception as e:
            fallback = (
                "I apologize, I experienced a brief connection glitch. "
                "Could you please repeat your last requirement?"
            )
            return {
                "response": fallback,
                "session_id": session_id,
                "status": "error",
                "error": str(e),
            }


# Singleton agent instance
sales_agent = SalesAgent()
