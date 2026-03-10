from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Reference(BaseModel):
    doi: str
    title: str
    author: Optional[str] = None
    abstract: Optional[str] = None
    year: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReferenceCreate(BaseModel):
    doi: str
    title: str
    author: Optional[str] = None
    abstract: Optional[str] = None
    year: Optional[int] = None


SQL_CREATE = """
CREATE TABLE IF NOT EXISTS public.reference (
    doi TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    abstract TEXT,
    year INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"""
