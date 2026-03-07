from pydantic import BaseModel
from typing import TypedDict, List, Optional, Dict

class CrossRefRequest(BaseModel):
    doi: str

class AuthorMetrics(BaseModel):
    name: str
    openalex_id: str
    h_index: int
    i10_index: int

class CrossRefResponse(BaseModel):
    doi: str
    full_text: Optional[str] = None
    download_url: Optional[str] = None
    authors_metrics: List[AuthorMetrics] = []
    errors: List[str] = []

class CrossRefState(TypedDict):
    doi: str
    full_text: Optional[str]
    download_url: Optional[str]
    authors_metrics: List[Dict]
    errors: List[str]
