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


class MendeleySyncRequest(BaseModel):
    """Request model for syncing papers to Mendeley"""
    doi: str
    title: str
    author: Optional[str] = None
    abstract: Optional[str] = None
    year: Optional[int] = None
    tags: Optional[List[str]] = None
    mendeley_access_token: str


class MendeleySyncResponse(BaseModel):
    """Response model for Mendeley sync"""
    success: bool
    mendeley_id: Optional[str] = None
    message: str
    error: Optional[str] = None
    doi: str
    title: str

