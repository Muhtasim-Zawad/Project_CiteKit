from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ReferenceBase(BaseModel):
    doi: str = Field(..., description="DOI of the reference, unique identifier")
    title: str
    author: Optional[str] = None
    abstract: Optional[str] = None

class ReferenceCreate(ReferenceBase):
    pass

class ReferenceResponse(ReferenceBase):
    add_time: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    title: str

class ProjectCreate(ProjectBase):
    pass  # user_id comes from JWT

class ProjectResponse(ProjectBase):
    project_id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    references: List[ReferenceResponse] = []

    class Config:
        from_attributes = True


class MessageResponse(BaseModel): 
    message: str


SQL_CREATE_PROJECTS = """
CREATE TABLE IF NOT EXISTS public.projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""