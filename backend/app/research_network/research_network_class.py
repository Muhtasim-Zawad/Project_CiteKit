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

class SemanticScholarByDOIRequest(BaseModel):
    """Request model for fetching paper data by DOI"""
    doi: str


class SemanticScholarByPaperIDRequest(BaseModel):
    """Request model for fetching paper details by Semantic Scholar paper ID"""
    paper_id: str


class SemanticScholarPaperResponse(BaseModel):
    """Response model for format_paper_response()"""
    success: bool
    paper_id: Optional[str] = None
    title: Optional[str] = None
    year: Optional[int] = None
    authors: Optional[List[AuthorInfo]] = None
    abstract: Optional[str] = None
    venue: Optional[str] = None
    doi: Optional[str] = None
    references: Optional[List[PaperSummary]] = None
    citations: Optional[List[PaperSummary]] = None
    references_count: int = 0
    citations_count: int = 0
    error: Optional[str] = None

