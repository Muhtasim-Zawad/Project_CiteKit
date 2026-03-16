from pydantic import BaseModel
from typing import Optional


class Author(BaseModel):
    id: Optional[int] = None
    name: str

    class Config:
        from_attributes = True


class AuthorCreate(BaseModel):
    name: str


SQL_CREATE = """
CREATE TABLE IF NOT EXISTS public.authors (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL
);
"""
