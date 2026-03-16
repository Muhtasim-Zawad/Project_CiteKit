from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class ProjectReference(BaseModel):
    project_id: UUID
    doi: str
    add_time: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectReferenceCreate(BaseModel):
    project_id: UUID
    doi: str


SQL_CREATE = """
CREATE TABLE IF NOT EXISTS public.project_reference (
    project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
    doi TEXT NOT NULL REFERENCES public.reference(doi) ON DELETE CASCADE,
    add_time TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (project_id, doi)
);
"""
