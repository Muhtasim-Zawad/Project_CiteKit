from pydantic import BaseModel
from typing import Optional, List


class AuthorInfo(BaseModel):
    """Author information"""
    name: str
    author_id: Optional[str] = None


class PaperSummary(BaseModel):
    """Shared model for references and citations (identical structure)"""
    paper_id: Optional[str] = None
    title: Optional[str] = None
    doi: Optional[str] = None
    year: Optional[int] = None
    authors: Optional[List[AuthorInfo]] = None
    venue: Optional[str] = None