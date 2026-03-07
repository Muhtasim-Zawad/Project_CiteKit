import requests
from langgraph.graph import StateGraph, END
from typing import Dict, Any

from app.agent.cross_ref_class import CrossRefState
from app.config import get_settings

settings = get_settings()

def get_core_api_url():
    """Returns the CORE Discover API endpoint."""
    return "https://api.core.ac.uk/v3/discover"

def fetch_core_data(state: CrossRefState) -> CrossRefState:
    """Fetch full text or download URL from CORE API using the DOI."""
    doi = state.get("doi")
    
    if not doi:
        state["errors"].append("No DOI provided for CORE API.")
        return state

    headers = {}
    if settings.core_api_key:
        headers["Authorization"] = f"Bearer {settings.core_api_key}"

    # CORE Discover API expects a JSON payload to discover by DOI
    payload = [{"doi": doi}]

    try:
        response = requests.post(get_core_api_url(), json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        if data and isinstance(data, list) and len(data) > 0:
            result = data[0]
            if "fullText" in result and result["fullText"]:
                state["full_text"] = result["fullText"]
            if "downloadUrl" in result and result["downloadUrl"]:
                state["download_url"] = result["downloadUrl"]
                
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            state["errors"].append("CORE API Unauthorized. Please check CORE API key.")
        elif e.response.status_code == 404:
             state["errors"].append(f"CORE API could not find data for DOI: {doi}")
        else:
            state["errors"].append(f"CORE API Error: {str(e)}")
    except Exception as e:
        state["errors"].append(f"Unexpected CORE API error: {str(e)}")

    return state


def fetch_openalex_metrics(state: CrossRefState) -> CrossRefState:
    """Fetch paper from OpenAlex by DOI, extract authors, and fetch their metrics."""
    doi = state.get("doi")
    
    if not doi:
        state["errors"].append("No DOI provided for OpenAlex API.")
        return state
        
    works_url = f"https://api.openalex.org/works/https://doi.org/{doi}"
    
    try:
        # 1. Fetch the work to get the author IDs
        response = requests.get(works_url)
        response.raise_for_status()
        work_data = response.json()
        
        authorships = work_data.get("authorships", [])
        
        # 2. Iterate through authors and fetch their metrics
        for authorship in authorships:
            author_data = authorship.get("author", {})
            author_id_url = author_data.get("id")
            author_name = author_data.get("display_name", "Unknown Author")
            
            if not author_id_url:
                continue
                
            # Extract the ID from the URL (e.g., https://openalex.org/A123 -> A123)
            # Or we can just query the URL directly since it behaves as an API endpoint
            try:
                author_response = requests.get(author_id_url)
                author_response.raise_for_status()
                author_details = author_response.json()
                
                summary_stats = author_details.get("summary_stats", {})
                
                metrics = {
                    "name": author_name,
                    "openalex_id": author_id_url,
                    "h_index": summary_stats.get("h_index", 0),
                    "i10_index": summary_stats.get("i10_index", 0)
                }
                
                state["authors_metrics"].append(metrics)
                
            except Exception as e:
                state["errors"].append(f"Error fetching metrics for author {author_name}: {str(e)}")
                
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            state["errors"].append(f"OpenAlex could not find work for DOI: {doi}")
        else:
            state["errors"].append(f"OpenAlex Works HTTP Error: {str(e)}")
    except Exception as e:
        state["errors"].append(f"Unexpected OpenAlex error: {str(e)}")

    return state

def create_cross_ref_agent():
    graph = StateGraph(CrossRefState)
    
    # Add Nodes
    graph.add_node("fetch_core", fetch_core_data)
    graph.add_node("fetch_openalex", fetch_openalex_metrics)
    
    # Execute sequentially since they don't depend on each other's outputs
    # But doing it sequentially is simpler than managing parallel execution in base LangGraph
    graph.add_edge("fetch_core", "fetch_openalex")
    graph.add_edge("fetch_openalex", END)
    
    graph.set_entry_point("fetch_core")
    
    return graph.compile()

# Export an instance
cross_ref_agent = create_cross_ref_agent()
