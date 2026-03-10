import requests
import httpx
import urllib.parse
from typing import Dict, List, Optional, Any

SEMANTIC_SCHOLAR_BASE_URL = "https://api.semanticscholar.org/graph/v1"

PAPER_FIELDS = [
    "paperId", "title", "authors", "year", "abstract", "venue", "doi",
    "references.paperId", "references.title", "references.year",
    "references.authors", "references.doi", "references.venue",
    "citations.paperId", "citations.title", "citations.year",
    "citations.authors", "citations.doi", "citations.venue"
]

REFERENCE_FIELDS = [
    "paperId", "title", "authors", "year", "abstract", "venue", "doi",
    "isOpenAccess", "citationCount", "referenceCount",
    "influentialCitationCount", "publicationVenue", "externalIds"
]


def clean_doi(doi: str) -> str:
    """Normalize DOI by stripping common prefixes."""
    return (
        doi.replace("https://doi.org/", "")
           .replace("http://doi.org/", "")
           .replace("doi.org/", "")
           .replace("DOI:", "")
           .strip()
    )


def parse_authors(authors: Optional[List[Dict]]) -> Optional[List[Dict]]:
    """Convert Semantic Scholar author format to a clean list."""
    if not authors:
        return None
    return [
        {
            "name": author.get("name", ""),
            "author_id": author.get("authorId")
        }
        for author in authors
    ]

def _handle_response(response: requests.Response, identifier: str) -> Dict[str, Any]:
    """Shared response handler for sync requests."""
    if response.status_code == 200:
        return {"success": True, "data": response.json(), "error": None}
    if response.status_code == 404:
        return {"success": False, "data": None, "error": f"Paper not found: {identifier}"}
    return {
        "success": False,
        "data": None,
        "error": f"Semantic Scholar error {response.status_code}: {response.text[:200]}"
    }


def _handle_httpx_response(response: httpx.Response, identifier: str) -> Dict[str, Any]:
    """Shared response handler for async httpx requests."""
    if response.status_code == 200:
        return {"success": True, "data": response.json(), "error": None}
    if response.status_code == 404:
        return {"success": False, "data": None, "error": f"Paper not found: {identifier}"}
    return {
        "success": False,
        "data": None,
        "error": f"Semantic Scholar error {response.status_code}: {response.text[:200]}"
    }