"""
VoceNexus AI — Voice WebSocket Endpoint
Handles real-time bidirectional voice conversation.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import logging
from app.agents.sales_agent import sales_agent

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Voice"])


@router.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time voice conversation.
    
    Client sends JSON:
        {"text": "customer spoken text", "session_id": "optional_id"}
    
    Server responds JSON:
        {
            "response": "AI spoken response text",
            "session_id": "session_id",
            "status": "success"
        }
    """
    await websocket.accept()
    session_id = f"session_{id(websocket)}"
    logger.info(f"WebSocket voice connection opened: {session_id}")

    try:
        # Initial greeting when connection established
        greeting = (
            "Hello! Welcome to Fortivex Solutions. I'm Nexus, your AI sales assistant. "
            "How can I help you automate and scale your business today?"
        )
        await websocket.send_text(
            json.dumps(
                {
                    "response": greeting,
                    "session_id": session_id,
                    "is_greeting": True,
                }
            )
        )

        while True:
            raw_data = await websocket.receive_text()

            try:
                data = json.loads(raw_data)
                user_text = data.get("text", "")
                custom_session = data.get("session_id")
                if custom_session:
                    session_id = custom_session
            except json.JSONDecodeError:
                user_text = raw_data

            user_text = user_text.strip()
            if not user_text:
                continue

            logger.info(f"[{session_id}] Customer: {user_text}")

            # Process through the AI Sales Agent
            result = sales_agent.process_message(session_id, user_text)

            logger.info(f"[{session_id}] Nexus: {result.get('response')}")

            # Send back to frontend for TTS rendering
            await websocket.send_text(json.dumps(result))

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket unexpected error [{session_id}]: {e}")
        try:
            await websocket.close()
        except Exception:
            pass
