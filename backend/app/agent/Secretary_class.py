from pydantic import BaseModel
from typing import Optional, List, Dict, Union


# -------- Zotero Models -------- #

class ZoteroSyncRequest(BaseModel):
    """Request model for syncing papers to Zotero"""
    doi: str
    title: str
    author: Optional[str] = None
    abstract: Optional[str] = None
    year: Optional[int] = None
    tags: Optional[List[str]] = None
    zotero_api_token: str
    user_zotero_id: str


class ZoteroSyncResponse(BaseModel):
    """Response model for Zotero sync"""
    success: bool
    zotero_id: Optional[str] = None
    message: str
    error: Optional[str] = None
    doi: str
    title: str