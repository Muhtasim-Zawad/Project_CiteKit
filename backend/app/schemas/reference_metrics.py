from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReferenceMetrics(BaseModel):
    doi: str
    times_cited: Optional[int] = None
    recent_citations: Optional[int] = None
    relative_citation_ratio: Optional[float] = None
    field_citation_ratio: Optional[float] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReferenceMetricsCreate(BaseModel):
    doi: str
    times_cited: Optional[int] = None
    recent_citations: Optional[int] = None
    relative_citation_ratio: Optional[float] = None
    field_citation_ratio: Optional[float] = None


class ReferenceMetricsUpdate(BaseModel):
    times_cited: Optional[int] = None
    recent_citations: Optional[int] = None
    relative_citation_ratio: Optional[float] = None
    field_citation_ratio: Optional[float] = None


SQL_CREATE = """
CREATE TABLE IF NOT EXISTS public.reference_metrics (
    doi TEXT PRIMARY KEY REFERENCES public.reference(doi) ON DELETE CASCADE,
    times_cited INT,
    recent_citations INT,
    relative_citation_ratio FLOAT,
    field_citation_ratio FLOAT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""
