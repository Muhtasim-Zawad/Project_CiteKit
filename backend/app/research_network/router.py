from fastapi import APIRouter, HTTPException
from .research_network_class import (
    SemanticScholarByDOIRequest,
    SemanticScholarPaperResponse,
    SemanticScholarByPaperIDRequest,
    ReferenceDetailsResponse
)
from .research_network_agent import (
    fetch_paper_by_doi,
    fetch_reference_details,
    format_paper_response,
    format_reference_response
)

router = APIRouter(prefix="/research-network", tags=["Semantic Scholar"])


@router.post("/by-doi", response_model=SemanticScholarPaperResponse)
def get_paper_by_doi(payload: SemanticScholarByDOIRequest):
    """
    Fetch paper data from Semantic Scholar by DOI.
    Returns paper metadata along with citations and references.
    """
    try:
        api_result = fetch_paper_by_doi(payload.doi)

        if not api_result["success"]:
            return SemanticScholarPaperResponse(
                success=False,
                doi=payload.doi,
                error=api_result.get("error", "Failed to fetch paper from Semantic Scholar")
            )

        formatted_data = format_paper_response(api_result["data"])

        return SemanticScholarPaperResponse(
            success=True,
            **formatted_data
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch paper data: {str(e)}")