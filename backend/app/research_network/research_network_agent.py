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