# router.py
from fastapi import APIRouter, HTTPException
from .Librarian_class import ResearchRequest, ResearchResponse
from .Librarian_agent import agent
from .cross_ref_class import CrossRefRequest, CrossRefResponse
from .cross__ref_agent import cross_ref_agent
from .Secretary_class import (
    ZoteroSyncRequest,
    ZoteroSyncResponse,
    MendeleySyncRequest,
    MendeleySyncResponse,
    ZoteroBatchSyncRequest,
    BatchZoteroSyncResponse,
    MendeleybatchSyncRequest,
    BatchMendeleySyncResponse
)
from .Secretary_agent import secretary_zotero_agent, secretary_mendeley_agent

router = APIRouter(prefix="/research", tags=["Research"])

@router.post("/", response_model=ResearchResponse)
def research_papers(payload: ResearchRequest):
    """
    Accepts a research query and returns papers found via the librarian agent.
    """
    try:
        # Prepare initial state for your LangGraph agent
        state = {
            "user_query": payload.query,
            "expanded_queries": [payload.query],
            "search_terms": "",
            "results": []
        }

        # Invoke agent
        final_state = agent.invoke(state)

        # Return structured response
        return {
            "search_terms": final_state.get("search_terms", ""),
            "results": final_state.get("results", [])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cross-ref", response_model=CrossRefResponse)
def get_cross_ref_data(payload: CrossRefRequest):
    """
    Accepts a DOI and returns enhanced data for the paper, including:
    - CORE API full text or download link
    - OpenAlex author metrics (h-index, i10-index)
    - Dimensions citation metrics (times_cited, recent_citations, RCR, FCR)
    """
    try:
        # Initial State
        initial_state = {
            "doi": payload.doi,
            "full_text": None,
            "download_url": None,
            "authors_metrics": [],
            "dimensions_metrics": None,
            "errors": []
        }

        # Invoke agent
        final_state = cross_ref_agent.invoke(initial_state)

        # Return structured response
        return {
            "doi": final_state.get("doi", payload.doi),
            "full_text": final_state.get("full_text"),
            "download_url": final_state.get("download_url"),
            "authors_metrics": final_state.get("authors_metrics", []),
            "dimensions_metrics": final_state.get("dimensions_metrics"),
            "errors": final_state.get("errors", [])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------- ZOTERO ROUTES -------- #

@router.post("/sync/zotero", response_model=ZoteroSyncResponse)
def sync_paper_to_zotero(payload: ZoteroSyncRequest):
    """
    Sync a single paper to Zotero.
    
    Required fields:
    - doi: Digital Object Identifier
    - title: Paper title
    - zotero_api_token: Your Zotero API key
    - user_zotero_id: Your Zotero user ID
    
    Optional fields:
    - author: Author names
    - abstract: Paper abstract
    - year: Publication year
    - tags: Tags to add to the paper
    """
    try:
        # Prepare initial state for zotero agent
        paper_data = {
            "title": payload.title,
            "doi": payload.doi,
            "author": payload.author,
            "abstract": payload.abstract,
            "year": payload.year,
            "tags": payload.tags or [],
            "zotero_api_token": payload.zotero_api_token,
            "user_zotero_id": payload.user_zotero_id
        }
        
        initial_state = {
            "paper_data": paper_data,
            "zotero_result": None,
            "errors": []
        }
        
        # Invoke secretary zotero agent
        final_state = secretary_zotero_agent.invoke(initial_state)
        
        zotero_result = final_state.get("zotero_result")
        errors = final_state.get("errors", [])
        
        if zotero_result:
            return {
                "doi": payload.doi,
                "title": payload.title,
                "success": zotero_result.get("success", False),
                "zotero_id": zotero_result.get("zotero_id"),
                "message": zotero_result.get("message", ""),
                "error": zotero_result.get("error")
            }
        else:
            return {
                "doi": payload.doi,
                "title": payload.title,
                "success": False,
                "zotero_id": None,
                "message": "Failed to sync to Zotero",
                "error": "; ".join(errors) if errors else "Unknown error"
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Zotero sync failed: {str(e)}")


@router.post("/sync/zotero/batch", response_model=BatchZoteroSyncResponse)
def batch_sync_papers_to_zotero(payload: ZoteroBatchSyncRequest):
    """
    Sync multiple papers to Zotero in batch.
    
    Args:
        payload: ZoteroBatchSyncRequest containing list of papers
    
    Returns:
        BatchZoteroSyncResponse with results for each paper
    """
    try:
        results = []
        successful_syncs = 0
        failed_syncs = 0
        
        for paper_request in payload.papers:
            try:
                # Prepare paper data
                paper_data = {
                    "title": paper_request.title,
                    "doi": paper_request.doi,
                    "author": paper_request.author,
                    "abstract": paper_request.abstract,
                    "year": paper_request.year,
                    "tags": paper_request.tags or [],
                    "zotero_api_token": paper_request.zotero_api_token,
                    "user_zotero_id": paper_request.user_zotero_id
                }
                
                initial_state = {
                    "paper_data": paper_data,
                    "zotero_result": None,
                    "errors": []
                }
                
                # Invoke secretary zotero agent for each paper
                final_state = secretary_zotero_agent.invoke(initial_state)
                
                zotero_result = final_state.get("zotero_result")
                errors = final_state.get("errors", [])
                
                success = zotero_result and zotero_result.get("success", False)
                
                if success:
                    successful_syncs += 1
                else:
                    failed_syncs += 1
                
                results.append({
                    "doi": paper_request.doi,
                    "title": paper_request.title,
                    "success": success,
                    "zotero_id": zotero_result.get("zotero_id") if zotero_result else None,
                    "message": zotero_result.get("message") if zotero_result else "; ".join(errors),
                    "error": zotero_result.get("error") if zotero_result else None
                })
            
            except Exception as paper_error:
                failed_syncs += 1
                results.append({
                    "doi": paper_request.doi,
                    "title": paper_request.title,
                    "success": False,
                    "zotero_id": None,
                    "message": "Failed to sync to Zotero",
                    "error": str(paper_error)
                })
        
        return {
            "total_papers": len(payload.papers),
            "successful_syncs": successful_syncs,
            "failed_syncs": failed_syncs,
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch Zotero sync failed: {str(e)}")


# -------- MENDELEY ROUTES -------- #

@router.post("/sync/mendeley", response_model=MendeleySyncResponse)
def sync_paper_to_mendeley(payload: MendeleySyncRequest):
    """
    Sync a single paper to Mendeley.
    
    Required fields:
    - doi: Digital Object Identifier
    - title: Paper title
    - mendeley_access_token: Your Mendeley API access token
    
    Optional fields:
    - author: Author names
    - abstract: Paper abstract
    - year: Publication year
    - tags: Tags to add to the paper
    """
    try:
        # Prepare initial state for mendeley agent
        paper_data = {
            "title": payload.title,
            "doi": payload.doi,
            "author": payload.author,
            "abstract": payload.abstract,
            "year": payload.year,
            "tags": payload.tags or [],
            "mendeley_credentials": {
                "access_token": payload.mendeley_access_token
            }
        }
        
        initial_state = {
            "paper_data": paper_data,
            "mendeley_result": None,
            "errors": []
        }
        
        # Invoke secretary mendeley agent
        final_state = secretary_mendeley_agent.invoke(initial_state)
        
        mendeley_result = final_state.get("mendeley_result")
        errors = final_state.get("errors", [])
        
        if mendeley_result:
            return {
                "doi": payload.doi,
                "title": payload.title,
                "success": mendeley_result.get("success", False),
                "mendeley_id": mendeley_result.get("mendeley_id"),
                "message": mendeley_result.get("message", ""),
                "error": mendeley_result.get("error")
            }
        else:
            return {
                "doi": payload.doi,
                "title": payload.title,
                "success": False,
                "mendeley_id": None,
                "message": "Failed to sync to Mendeley",
                "error": "; ".join(errors) if errors else "Unknown error"
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mendeley sync failed: {str(e)}")


@router.post("/sync/mendeley/batch", response_model=BatchMendeleySyncResponse)
def batch_sync_papers_to_mendeley(payload: MendeleybatchSyncRequest):
    """
    Sync multiple papers to Mendeley in batch.
    
    Args:
        payload: MendeleybatchSyncRequest containing list of papers
    
    Returns:
        BatchMendeleySyncResponse with results for each paper
    """
    try:
        results = []
        successful_syncs = 0
        failed_syncs = 0
        
        for paper_request in payload.papers:
            try:
                # Prepare paper data
                paper_data = {
                    "title": paper_request.title,
                    "doi": paper_request.doi,
                    "author": paper_request.author,
                    "abstract": paper_request.abstract,
                    "year": paper_request.year,
                    "tags": paper_request.tags or [],
                    "mendeley_credentials": {
                        "access_token": paper_request.mendeley_access_token
                    }
                }
                
                initial_state = {
                    "paper_data": paper_data,
                    "mendeley_result": None,
                    "errors": []
                }
                
                # Invoke secretary mendeley agent for each paper
                final_state = secretary_mendeley_agent.invoke(initial_state)
                
                mendeley_result = final_state.get("mendeley_result")
                errors = final_state.get("errors", [])
                
                success = mendeley_result and mendeley_result.get("success", False)
                
                if success:
                    successful_syncs += 1
                else:
                    failed_syncs += 1
                
                results.append({
                    "doi": paper_request.doi,
                    "title": paper_request.title,
                    "success": success,
                    "mendeley_id": mendeley_result.get("mendeley_id") if mendeley_result else None,
                    "message": mendeley_result.get("message") if mendeley_result else "; ".join(errors),
                    "error": mendeley_result.get("error") if mendeley_result else None
                })
            
            except Exception as paper_error:
                failed_syncs += 1
                results.append({
                    "doi": paper_request.doi,
                    "title": paper_request.title,
                    "success": False,
                    "mendeley_id": None,
                    "message": "Failed to sync to Mendeley",
                    "error": str(paper_error)
                })
        
        return {
            "total_papers": len(payload.papers),
            "successful_syncs": successful_syncs,
            "failed_syncs": failed_syncs,
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch Mendeley sync failed: {str(e)}")
