from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class Chat(BaseModel):
    id: Optional[int] = None
    project_id: UUID
    query: str
    search_terms: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    project_id: UUID
    query: str
    search_terms: Optional[str] = None


SQL_CREATE = """
CREATE TABLE IF NOT EXISTS public.chat (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    search_terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"""
