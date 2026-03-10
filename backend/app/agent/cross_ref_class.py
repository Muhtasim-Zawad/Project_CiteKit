from pydantic import BaseModel
from typing import TypedDict, List, Optional, Dict

class CrossRefRequest(BaseModel):
    doi: str

class AuthorMetrics(BaseModel):
    name: str
    openalex_id: str
    h_index: int
    i10_index: int

class DimensionsMetrics(BaseModel):
    times_cited: int = 0
    recent_citations: int = 0
    relative_citation_ratio: Optional[float] = None
    field_citation_ratio: Optional[float] = None

class CrossRefResponse(BaseModel):
    doi: str
    full_text: Optional[str] = None
    download_url: Optional[str] = None
    authors_metrics: List[AuthorMetrics] = []
    dimensions_metrics: Optional[DimensionsMetrics] = None
    errors: List[str] = []

class CrossRefState(TypedDict):
    doi: str
    full_text: Optional[str]
    download_url: Optional[str]
    authors_metrics: List[Dict]
    dimensions_metrics: Optional[Dict]
    errors: List[str]
