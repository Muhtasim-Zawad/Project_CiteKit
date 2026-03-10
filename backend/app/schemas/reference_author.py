from pydantic import BaseModel
from typing import Optional


class ReferenceAuthor(BaseModel):
    doi: str
    author_id: int
    position: Optional[int] = None

    class Config:
        from_attributes = True


class ReferenceAuthorCreate(BaseModel):
    doi: str
    author_id: int
    position: Optional[int] = None


SQL_CREATE = """
CREATE TABLE IF NOT EXISTS public.reference_authors (
    doi TEXT NOT NULL REFERENCES public.reference(doi) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
    position INT,
    PRIMARY KEY (doi, author_id)
);
"""
