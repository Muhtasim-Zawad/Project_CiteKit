from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.schemas.chat_result import ChatResultResponse


class Chat(BaseModel):
    id: Optional[int] = None
    thread_id: UUID
    query: str
    search_terms: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    thread_id: UUID
    query: str


class ChatMessage(BaseModel):
    id: int
    query: str
    search_terms: Optional[str] = None
    created_at: Optional[datetime] = None


class ChatResponse(BaseModel):
    id: int
    thread_id: UUID
    query: str
    search_terms: Optional[str] = None
    created_at: Optional[datetime] = None
    results: List[ChatResultResponse] = []


SQL_CREATE = """
CREATE TABLE IF NOT EXISTS public.chat (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    thread_id UUID NOT NULL REFERENCES public.thread(thread_id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    search_terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"""
