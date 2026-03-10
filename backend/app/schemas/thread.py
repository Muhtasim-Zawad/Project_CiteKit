from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ThreadCreate(BaseModel):
    project_id: UUID
    title: Optional[str] = None


class ThreadUpdate(BaseModel):
    title: Optional[str] = None


class ThreadResponse(BaseModel):
    thread_id: str
    project_id: str
    title: Optional[str] = None
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ThreadSummary(BaseModel):
    thread_id: str
    title: Optional[str] = None
    summary: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True
