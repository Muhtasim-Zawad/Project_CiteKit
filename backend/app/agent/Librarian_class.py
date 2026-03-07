
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import TypedDict, Optional, List, Dict, Union

class ResearchRequest(BaseModel):
    query: str

class Paper(BaseModel):
    title: str
    doi: str
    year: Union[int, str]
    abstract: str
    metrics: Optional[List[Dict]] = None
    full_text: Optional[str] = None
    download_url: Optional[str] = None
    cross_ref_error: Optional[str] = None
    score: Optional[int] = None
    critic_reasoning: Optional[str] = None

class ResearchResponse(BaseModel):
    search_terms: str
    results: List[Paper]


class AgentState(TypedDict):
    user_query: str
    search_terms: str
    results: list
