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

def push_to_zotero(
    paper: Dict[str, Any],
    api_token: str,
    user_zotero_id: str,
    tags: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Push a paper to Zotero using their API.
    
    Args:
        paper: Paper data containing title, author, DOI, abstract, year
        api_token: Zotero API token
        user_zotero_id: User's Zotero ID
        tags: Optional list of tags to attach
    
    Returns:
        Dict with success status and Zotero item key
    """
    try:
        # Zotero API endpoint
        base_url = f"https://api.zotero.org/users/{user_zotero_id}/items"
        
        # Build item data
        item_data = {
            "itemType": "journalArticle",
            "title": paper.get("title", ""),
            "creators": [],
            "abstract": paper.get("abstract", ""),
            "date": str(paper.get("year", "")),
        }
        
        # Add DOI if available
        if paper.get("doi"):
            item_data["DOI"] = paper["doi"].replace("https://doi.org/", "")
        
        # Parse authors
        if paper.get("author"):
            authors = paper["author"].split(",")
            for author in authors:
                author = author.strip()
                if author:
                    name_parts = author.split()
                    if len(name_parts) >= 2:
                        item_data["creators"].append({
                            "creatorType": "author",
                            "firstName": " ".join(name_parts[:-1]),
                            "lastName": name_parts[-1]
                        })
                    else:
                        item_data["creators"].append({
                            "creatorType": "author",
                            "name": author
                        })
        
        # Add tags
        if tags:
            item_data["tags"] = [{"tag": tag} for tag in tags]
        
        # Prepare request
        headers = {
            "Zotero-API-Version": "3",
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
        
        # Create the item
        response = requests.post(
            base_url,
            json=[{"itemType": "journalArticle", **item_data}],
            headers=headers,
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            # Extract the key from response header or body
            location = response.headers.get("Location", "")
            zotero_key = location.split("/")[-1] if location else "unknown"
            
            return {
                "success": True,
                "zotero_id": zotero_key,
                "message": f"Successfully pushed to Zotero with key {zotero_key}",
                "error": None
            }
        else:
            error_msg = f"Zotero API returned status {response.status_code}: {response.text}"
            return {
                "success": False,
                "zotero_id": None,
                "message": f"Failed to push to Zotero",
                "error": error_msg
            }
    
    except Exception as e:
        return {
            "success": False,
            "zotero_id": None,
            "message": "Failed to push to Zotero",
            "error": str(e)
        }

def sync_zotero_node(state: SecretaryZoteroAgentState) -> SecretaryZoteroAgentState:
    """Sync paper data to Zotero platform only"""
    
    paper_data = state["paper_data"]
    errors = state.get("errors", [])
    zotero_result = None
    
    try:
        zotero_api_token = paper_data.get("zotero_api_token")
        user_zotero_id = paper_data.get("user_zotero_id")
        
        if not zotero_api_token or not user_zotero_id:
            errors.append("Zotero credentials missing (API token and/or User ID)")
        else:
            zotero_result = push_to_zotero(
                paper_data,
                zotero_api_token,
                user_zotero_id,
                tags=paper_data.get("tags")
            )
    
    except Exception as e:
        errors.append(f"Zotero sync error: {str(e)}")
    
    return {
        **state,
        "zotero_result": zotero_result,
        "errors": errors
    }


def push_to_mendeley(
    paper: Dict[str, Any],
    access_token: str,
    tags: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Push a paper to Mendeley using their API.
    
    Args:
        paper: Paper data containing title, author, DOI, abstract, year
        access_token: Mendeley API access token
        tags: Optional list of tags to attach
    
    Returns:
        Dict with success status and Mendeley document ID
    """
    try:
        # Mendeley API endpoint
        base_url = "https://api.mendeley.com/documents"
        
        # Build document data
        doc_data = {
            "title": paper.get("title", ""),
            "abstract": paper.get("abstract", ""),
            "year": paper.get("year"),
            "type": "journal"
        }
        
        # Add DOI if available
        if paper.get("doi"):
            doc_data["identifiers"] = {
                "doi": paper["doi"].replace("https://doi.org/", "")
            }
        
        # Add authors
        if paper.get("author"):
            authors = paper["author"].split(",")
            doc_data["authors"] = [
                {"firstName": name.strip().split()[0] if name.strip().split() else "",
                 "lastName": " ".join(name.strip().split()[1:]) if len(name.strip().split()) > 1 else name.strip()}
                for name in authors
                if name.strip()
            ]
        
        # Add tags/keywords
        if tags:
            doc_data["keywords"] = tags
        
        # Prepare request
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # Create the document
        response = requests.post(
            base_url,
            json=doc_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            response_data = response.json()
            mendeley_id = response_data.get("id", "unknown")
            
            return {
                "success": True,
                "mendeley_id": mendeley_id,
                "message": f"Successfully pushed to Mendeley with ID {mendeley_id}",
                "error": None
            }
        else:
            error_msg = f"Mendeley API returned status {response.status_code}: {response.text}"
            return {
                "success": False,
                "mendeley_id": None,
                "message": "Failed to push to Mendeley",
                "error": error_msg
            }
    
    except Exception as e:
        return {
            "success": False,
            "mendeley_id": None,
            "message": "Failed to push to Mendeley",
            "error": str(e)
        }

def sync_mendeley_node(state: SecretaryMendeleyAgentState) -> SecretaryMendeleyAgentState:
    """Sync paper data to Mendeley platform only"""
    
    paper_data = state["paper_data"]
    errors = state.get("errors", [])
    mendeley_result = None
    
    try:
        mendeley_creds = paper_data.get("mendeley_credentials")
        
        if not mendeley_creds or "access_token" not in mendeley_creds:
            errors.append("Mendeley credentials missing (access token required)")
        else:
            mendeley_result = push_to_mendeley(
                paper_data,
                mendeley_creds["access_token"],
                tags=paper_data.get("tags")
            )
    
    except Exception as e:
        errors.append(f"Mendeley sync error: {str(e)}")
    
    return {
        **state,
        "mendeley_result": mendeley_result,
        "errors": errors
    }

def create_secretary_zotero_agent():
    """Create the secretary agent for syncing papers to Zotero only"""
    
    workflow = StateGraph(SecretaryZoteroAgentState)
    
    # Add nodes
    workflow.add_node("sync_zotero", sync_zotero_node)
    
    # Define entry and exit points
    workflow.set_entry_point("sync_zotero")
    workflow.add_edge("sync_zotero", END)
    
    return workflow.compile()


def create_secretary_mendeley_agent():
    """Create the secretary agent for syncing papers to Mendeley only"""
    
    workflow = StateGraph(SecretaryMendeleyAgentState)
    
    # Add nodes
    workflow.add_node("sync_mendeley", sync_mendeley_node)
    
    # Define entry and exit points
    workflow.set_entry_point("sync_mendeley")
    workflow.add_edge("sync_mendeley", END)
    
    return workflow.compile()


# Create the compiled agents
secretary_zotero_agent = create_secretary_zotero_agent()
secretary_mendeley_agent = create_secretary_mendeley_agent()