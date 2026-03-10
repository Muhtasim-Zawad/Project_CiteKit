from pydantic import BaseModel
from typing import TypedDict, Optional


class QueryExpansionRequest(BaseModel):
    user_query: str
    research_summary: str


class QueryExpansionResponse(BaseModel):
    expanded_queries: list[str]


class QueryExpansionState(TypedDict):
    user_query: str
    research_summary: str
    expanded_queries: Optional[list[str]]
