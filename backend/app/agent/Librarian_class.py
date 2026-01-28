
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import TypedDict

class ResearchRequest(BaseModel):
    query: str

class Paper(BaseModel):
    title: str
    doi: str
    year: str
    abstract: str

class ResearchResponse(BaseModel):
    search_terms: str
    results: list


class AgentState(TypedDict):
    user_query: str
    search_terms: str
    results: list
