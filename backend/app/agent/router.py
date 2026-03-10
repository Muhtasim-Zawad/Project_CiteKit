# router.py
from fastapi import APIRouter, HTTPException
from .Librarian_class import ResearchRequest, ResearchResponse
from .Librarian_agent import agent
from .cross_ref_class import CrossRefRequest, CrossRefResponse
from .cross__ref_agent import cross_ref_agent

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
