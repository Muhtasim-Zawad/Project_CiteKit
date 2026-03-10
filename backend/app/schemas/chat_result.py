from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatResult(BaseModel):
    id: Optional[int] = None
    chat_id: int
    doi: str
    score: Optional[float] = None
    critic_reasoning: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatResultCreate(BaseModel):
    chat_id: int
    doi: str
    score: Optional[float] = None
    critic_reasoning: Optional[str] = None


class ChatResultResponse(BaseModel):
    id: Optional[int] = None
    doi: str
    title: Optional[str] = None
    author: Optional[str] = None
    abstract: Optional[str] = None
    year: Optional[int] = None
    score: Optional[float] = None
    critic_reasoning: Optional[str] = None
    full_text: Optional[str] = None
    download_url: Optional[str] = None
    dimensions_metrics: Optional[dict] = None


SQL_CREATE = """
CREATE TABLE IF NOT EXISTS public.chat_results (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chat_id BIGINT NOT NULL REFERENCES public.chat(id) ON DELETE CASCADE,
    doi TEXT NOT NULL REFERENCES public.reference(doi),
    score DOUBLE PRECISION,
    critic_reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"""
