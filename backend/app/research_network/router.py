from fastapi import APIRouter, HTTPException, Query
from .research_network_class import (
    SemanticScholarPaperResponse,
    ReferenceDetailsResponse
)
from .research_network_agent import (
    fetch_paper_by_doi,
    fetch_reference_details,
    format_paper_response,
    format_reference_response
)

router = APIRouter(prefix="/research-network", tags=["Semantic Scholar"])


@router.get("/by-doi", response_model=SemanticScholarPaperResponse)
def get_paper_by_doi(doi: str = Query(..., description="DOI of the paper, e.g. 10.1234/xyz")):
    """
    Fetch paper data from Semantic Scholar by DOI.
    Returns paper metadata along with citations and references.
    """
    try:
        api_result = fetch_paper_by_doi(doi)

        if not api_result["success"]:
            return SemanticScholarPaperResponse(
                success=False,
                doi=doi,
                error=api_result.get("error", "Failed to fetch paper from Semantic Scholar")
            )

        formatted_data = format_paper_response(api_result["data"])

        return SemanticScholarPaperResponse(
            success=True,
            **formatted_data
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch paper data: {str(e)}")
