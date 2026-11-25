"""
VoceNexus AI — Voice WebSocket Endpoint
Handles real-time bidirectional voice conversation and automated post-call summarization.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import logging
import datetime
from app.agents.sales_agent import sales_agent
from app.agents.memory import memory
from app.services.summarizer import call_summarizer
from app.database.connection import SessionLocal
from app.database.models import Conversation, Message, CallSummary

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Voice"])


@router.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time voice conversation.
    Client sends JSON: {"text": "customer speech", "session_id": "optional"}
    Server responds JSON: {"response": "...", "lead_score": 75, "appointment": {...}}
    """
    await websocket.accept()
    session_id = f"session_{id(websocket)}"
    logger.info(f"WebSocket voice connection opened: {session_id}")

    db = SessionLocal()
    conversation_record = None

    try:
        # Initialize conversation record in DB
        conversation_record = Conversation(
            session_id=session_id,
            started_at=datetime.datetime.utcnow(),
            status="active"
        )
        db.add(conversation_record)
        db.commit()
        db.refresh(conversation_record)

        # Initial warm greeting
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

            # Record user message in DB
            if conversation_record:
                user_msg_db = Message(
                    conversation_id=conversation_record.id,
                    role="user",
                    content=user_text
                )
                db.add(user_msg_db)
                db.commit()

            # Process through the AI Sales Agent
            result = sales_agent.process_message(session_id, user_text)

            # Record agent message in DB
            if conversation_record and result.get("response"):
                agent_msg_db = Message(
                    conversation_id=conversation_record.id,
                    role="assistant",
                    content=result["response"],
                    sentiment=result.get("sentiment")
                )
                db.add(agent_msg_db)
                db.commit()

            logger.info(f"[{session_id}] Nexus: {result.get('response')}")

            # Send back to frontend for audio TTS rendering
            await websocket.send_text(json.dumps(result))

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket unexpected error [{session_id}]: {e}")
        try:
            await websocket.close()
        except Exception:
            pass
    finally:
        # Post-Call Intelligence: Generate Call Summary
        try:
            if conversation_record:
                conversation_record.ended_at = datetime.datetime.utcnow()
                conversation_record.status = "completed"

                history = memory.get_history(session_id)
                if len(history) >= 2:
                    summary_res = call_summarizer.summarize_conversation(history)
                    call_summary = CallSummary(
                        conversation_id=conversation_record.id,
                        summary=summary_res["summary"],
                        sentiment_overall=summary_res["sentiment_overall"],
                        lead_score=75,
                        key_topics=summary_res["key_topics"],
                        next_steps=summary_res["next_steps"]
                    )
                    db.add(call_summary)

                db.commit()
        except Exception as summary_err:
            logger.error(f"Error finalizing call summary: {summary_err}")
            db.rollback()
        finally:
            db.close()
