import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Boolean, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from db.session import Base


def generate_uuid():
    return str(uuid.uuid4())


def now():
    return datetime.utcnow()


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    clerk_user_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    plan: Mapped[str] = mapped_column(String, nullable=True, default="free")
    stripe_customer_id: Mapped[str] = mapped_column(String, nullable=True)

    # Relationships — lets you do user.bots to get all bots for this user
    bots: Mapped[list["Bot"]] = relationship("Bot", back_populates="user")


class Bot(Base):
    __tablename__ = "bots"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    system_prompt: Mapped[str] = mapped_column(Text, nullable=True)
    welcome_message: Mapped[str] = mapped_column(String, default="Hi! How can I help?")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    hr_contact_name: Mapped[str] = mapped_column(String, nullable=True)
    hr_contact_email: Mapped[str] = mapped_column(String, nullable=True)
    hr_contact_slack: Mapped[str] = mapped_column(String, nullable=True)

    # Self-reported employee count; honor system for MVP
    employees_covered: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    # Computed from sum of document page_counts after each successful index
    pages_indexed_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="bots")
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="bot")
    conversations: Mapped[list["Conversation"]] = relationship(
        "Conversation", back_populates="bot"
    )


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    bot_id: Mapped[str] = mapped_column(String, ForeignKey("bots.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String, nullable=False)
    file_url: Mapped[str] = mapped_column(String, nullable=True)
    # Status tracks where we are in processing: uploaded → parsing → indexing → ready
    status: Mapped[str] = mapped_column(String, default="uploaded")
    raw_text: Mapped[str] = mapped_column(String, nullable=True)
    # ceil(token_count / 500); set after successful index
    page_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    bot: Mapped["Bot"] = relationship("Bot", back_populates="documents")
    chunks: Mapped[list["DocumentChunk"]] = relationship(
        "DocumentChunk", back_populates="document"
    )


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    document_id: Mapped[str] = mapped_column(
        String, ForeignKey("documents.id"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_index: Mapped[int] = mapped_column(nullable=False)
    # Vector(1536) stores OpenAI embeddings — 1536 is the dimension size for text-embedding-3-small
    embedding: Mapped[list[float]] = mapped_column(Vector(1536), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    document: Mapped["Document"] = relationship("Document", back_populates="chunks")


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    bot_id: Mapped[str] = mapped_column(String, ForeignKey("bots.id"), nullable=False)
    # session_id identifies a unique chat session (one new hire = one session)
    session_id: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    bot: Mapped["Bot"] = relationship("Bot", back_populates="conversations")
    messages: Mapped[list["Message"]] = relationship(
        "Message", back_populates="conversation"
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    conversation_id: Mapped[str] = mapped_column(
        String, ForeignKey("conversations.id"), nullable=False
    )
    # role is either "user" (new hire) or "assistant" (the AI)
    role: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    had_fallback: Mapped[bool] = mapped_column(Boolean, default=False)

    conversation: Mapped["Conversation"] = relationship(
        "Conversation", back_populates="messages"
    )


class UsageEvent(Base):
    __tablename__ = "usage_events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    bot_id: Mapped[str] = mapped_column(String, ForeignKey("bots.id"), nullable=False)
    model: Mapped[str] = mapped_column(String, nullable=False)
    input_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    output_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    cost_usd: Mapped[float] = mapped_column(Numeric(10, 6), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
