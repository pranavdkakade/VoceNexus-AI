"""
Session Memory Manager for VoceNexus AI Sales Agent.
Keeps conversation history in memory per session with sliding window.
"""

from typing import Dict, List, Any


class ConversationMemory:
    def __init__(self, max_history_turns: int = 10):
        # session_id -> list of {"role": "user"|"assistant", "content": str}
        self.sessions: Dict[str, List[Dict[str, str]]] = {}
        self.metadata: Dict[str, Dict[str, Any]] = {}
        self.max_history_turns = max_history_turns

    def get_history(self, session_id: str) -> List[Dict[str, str]]:
        """Return history for a session."""
        return self.sessions.get(session_id, [])

    def add_message(self, session_id: str, role: str, content: str):
        """Append a message and trim to sliding window."""
        if session_id not in self.sessions:
            self.sessions[session_id] = []
            self.metadata[session_id] = {}

        self.sessions[session_id].append({"role": role, "content": content})

        # Keep last (max_history_turns * 2) messages (turns)
        max_messages = self.max_history_turns * 2
        if len(self.sessions[session_id]) > max_messages:
            self.sessions[session_id] = self.sessions[session_id][-max_messages:]

    def clear(self, session_id: str):
        """Reset a session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
        if session_id in self.metadata:
            del self.metadata[session_id]


# Singleton instance
memory = ConversationMemory()
