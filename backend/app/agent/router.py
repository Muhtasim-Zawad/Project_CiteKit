# router.py
from fastapi import APIRouter, HTTPException
from .Librarian_class import ResearchRequest, ResearchResponse
from .Librarian_agent import agent

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
