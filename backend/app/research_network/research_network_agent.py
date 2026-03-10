import requests
import httpx
import urllib.parse
from typing import Dict, List, Optional, Any

SEMANTIC_SCHOLAR_BASE_URL = "https://api.semanticscholar.org/graph/v1"

PAPER_FIELDS = [
    "paperId", "title", "authors", "year", "abstract", "venue", "externalIds",
    "references.paperId", "references.title", "references.year",
    "references.authors", "references.externalIds", "references.venue",
    "citations.paperId", "citations.title", "citations.year",
    "citations.authors", "citations.externalIds", "citations.venue"
]

REFERENCE_FIELDS = [
    "paperId", "title", "authors", "year", "abstract", "venue", "externalIds",
    "isOpenAccess", "citationCount", "referenceCount",
    "influentialCitationCount", "publicationVenue"
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

def fetch_paper_by_doi(doi: str) -> Dict[str, Any]:
    """Fetch paper data from Semantic Scholar using DOI (sync)."""
    try:
        clean = clean_doi(doi)
        url = f"{SEMANTIC_SCHOLAR_BASE_URL}/paper/{urllib.parse.quote(clean, safe='/')}"
        response = requests.get(url, params={"fields": ",".join(PAPER_FIELDS)}, timeout=15)
        return _handle_response(response, f"DOI: {clean}")
    except requests.exceptions.Timeout:
        return {"success": False, "data": None, "error": "Semantic Scholar request timed out"}
    except Exception as e:
        return {"success": False, "data": None, "error": str(e)}


def fetch_reference_details(paper_id: str) -> Dict[str, Any]:
    """Fetch detailed information for a paper by Semantic Scholar ID (sync)."""
    try:
        url = f"{SEMANTIC_SCHOLAR_BASE_URL}/paper/{paper_id}"
        response = requests.get(url, params={"fields": ",".join(REFERENCE_FIELDS)}, timeout=15)
        return _handle_response(response, f"ID: {paper_id}")
    except requests.exceptions.Timeout:
        return {"success": False, "data": None, "error": "Semantic Scholar request timed out"}
    except Exception as e:
        return {"success": False, "data": None, "error": str(e)}
    

async def fetch_paper_by_doi_async(doi: str) -> Dict[str, Any]:
    """Fetch paper data from Semantic Scholar using DOI (async)."""
    try:
        clean = clean_doi(doi)
        url = f"{SEMANTIC_SCHOLAR_BASE_URL}/paper/{urllib.parse.quote(clean, safe='/')}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params={"fields": ",".join(PAPER_FIELDS)}, timeout=15)
        return _handle_httpx_response(response, f"DOI: {clean}")
    except httpx.TimeoutException:
        return {"success": False, "data": None, "error": "Semantic Scholar request timed out"}
    except Exception as e:
        return {"success": False, "data": None, "error": str(e)}


async def fetch_reference_details_async(paper_id: str) -> Dict[str, Any]:
    """Fetch detailed information for a paper by Semantic Scholar ID (async)."""
    try:
        url = f"{SEMANTIC_SCHOLAR_BASE_URL}/paper/{paper_id}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params={"fields": ",".join(REFERENCE_FIELDS)}, timeout=15)
        return _handle_httpx_response(response, f"ID: {paper_id}")
    except httpx.TimeoutException:
        return {"success": False, "data": None, "error": "Semantic Scholar request timed out"}
    except Exception as e:
        return {"success": False, "data": None, "error": str(e)}


def format_paper_response(api_response: Dict) -> Dict[str, Any]:
    """Convert raw Semantic Scholar paper response into clean structured data."""
    if not api_response:
        return {}

    references = [
        {
            "paper_id": ref.get("paperId"),
            "title": ref.get("title"),
            "doi": (ref.get("externalIds") or {}).get("DOI"),
            "year": ref.get("year"),
            "authors": parse_authors(ref.get("authors")),
            "venue": ref.get("venue")
        }
        for ref in (api_response.get("references") or [])[:100]
    ]

    citations = [
        {
            "paper_id": citation.get("paperId"),
            "title": citation.get("title"),
            "doi": (citation.get("externalIds") or {}).get("DOI"),
            "year": citation.get("year"),
            "authors": parse_authors(citation.get("authors")),
            "venue": citation.get("venue")
        }
        for citation in (api_response.get("citations") or [])[:100]
    ]

    return {
        "paper_id": api_response.get("paperId"),
        "title": api_response.get("title"),
        "year": api_response.get("year"),
        "authors": parse_authors(api_response.get("authors")),
        "abstract": api_response.get("abstract"),
        "venue": api_response.get("venue"),
        "doi": (api_response.get("externalIds") or {}).get("DOI"),
        "references": references or None,
        "citations": citations or None,
        "references_count": len(references),
        "citations_count": len(citations)
    }


def format_reference_response(api_response: Dict) -> Dict[str, Any]:
    """Format a reference detail response into clean structured data."""
    if not api_response:
        return {}

    return {
        "paper_id": api_response.get("paperId"),
        "title": api_response.get("title"),
        "year": api_response.get("year"),
        "authors": parse_authors(api_response.get("authors")),
        "abstract": api_response.get("abstract"),
        "venue": api_response.get("venue"),
        "doi": (api_response.get("externalIds") or {}).get("DOI"),
        "is_open_access": api_response.get("isOpenAccess"),
        "citations_count": api_response.get("citationCount"),
        "references_count": api_response.get("referenceCount"),
        "influential_citations_count": api_response.get("influentialCitationCount")
    }