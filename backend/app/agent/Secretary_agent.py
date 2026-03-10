import requests
import json
from typing import Dict, List, Optional, Any, TypedDict
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from app.config import get_settings
import urllib.parse

settings = get_settings()

class SecretaryZoteroAgentState(TypedDict):
    paper_data: Dict
    zotero_result: Optional[Dict]
    errors: List[str]

class SecretaryMendeleyAgentState(TypedDict):
    paper_data: Dict
    mendeley_result: Optional[Dict]
    errors: List[str]