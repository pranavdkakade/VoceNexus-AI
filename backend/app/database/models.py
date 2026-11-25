"""
SQLAlchemy ORM Models for VoceNexus AI.
Defines: Customer, Lead, Conversation, Message, Appointment, CallSummary.
"""

import datetime
import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base


def generate_id():
    return str(uuid.uuid4())[:8]


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=generate_id)
    name = Column(String(120), nullable=True, default="Prospect")
    email = Column(String(150), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    leads = relationship("Lead", back_populates="customer", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="customer", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="customer", cascade="all, delete-orphan")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, default=generate_id)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=True)
    business_type = Column(String(100), default="General Enterprise")
    requirements = Column(JSON, default=list)  # stored as list of strings
    budget = Column(String(100), nullable=True)
    lead_score = Column(Integer, default=0)
    lead_status = Column(String(50), default="new")  # qualified, warm, nurture
    next_action = Column(String(100), default="book_demo")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="leads")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_id)
    session_id = Column(String(100), unique=True, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="completed")

    customer = relationship("Customer", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    summary = relationship("CallSummary", back_populates="conversation", uselist=False, cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_id)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    sentiment = Column(String(30), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=lambda: f"APPT-{str(uuid.uuid4())[:6].upper()}")
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=True)
    customer_name = Column(String(120), nullable=True)
    customer_email = Column(String(150), nullable=True)
    slot = Column(String(100), nullable=False)
    status = Column(String(50), default="confirmed")  # confirmed, completed, cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="appointments")


class CallSummary(Base):
    __tablename__ = "call_summaries"

    id = Column(String(36), primary_key=True, default=generate_id)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), unique=True, nullable=False)
    summary = Column(Text, nullable=False)
    sentiment_overall = Column(String(50), default="positive")
    lead_score = Column(Integer, default=0)
    key_topics = Column(JSON, default=list)
    next_steps = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="summary")
