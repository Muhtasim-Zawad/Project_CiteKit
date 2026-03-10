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
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass  # user_id comes from JWT

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

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


class ProjectSummary(BaseModel):
    project_id: str
    title: str
    description: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True


SQL_CREATE_PROJECTS = """
CREATE TABLE IF NOT EXISTS public.projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""