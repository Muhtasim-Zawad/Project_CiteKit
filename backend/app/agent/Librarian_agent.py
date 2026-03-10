import requests
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from .Librarian_class import AgentState
from app.config import get_settings
from .cross__ref_agent import cross_ref_agent
from concurrent.futures import ThreadPoolExecutor, as_completed
from app.db.supabase import supabase
from collections import Counter

# -------- OpenAlex Helpers -------- #
settings = get_settings()

def de_invert_abstract(inverted_index):
    if not inverted_index:
        return "No abstract available."

    abstract_words = {}
    for word, positions in inverted_index.items():
        for pos in positions:
            abstract_words[pos] = word

    return " ".join(abstract_words[i] for i in sorted(abstract_words))


def search_openalex(search_query: str, per_page: int = 5):
    base_url = "https://api.openalex.org/works"
    params = {"search": search_query, "per_page": per_page}

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()

        results = []
        for work in data.get('results', [])[:per_page]:
            title = work.get('display_name', 'N/A')
            doi = work.get('doi', 'N/A')
            year = work.get('publication_year', 'N/A')

            raw_abstract = work.get('abstract_inverted_index')
            abstract_text = de_invert_abstract(raw_abstract)

            # Extract author names from authorships
            authorships = work.get('authorships', [])
            author_names = ", ".join(
                a.get('author', {}).get('display_name', '')
                for a in authorships
                if a.get('author', {}).get('display_name')
            ) or None

            results.append({
                'title': title,
                'doi': doi,
                'year': year,
                'abstract': abstract_text,
                'author': author_names
            })

        return results
    except Exception as e:
        return [{"error": str(e)}]


# -------- LangGraph State -------- #

def get_llm():
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0,
        api_key=settings.groq_api_key
    )


# -------- Helpers -------- #

def _normalize_doi(doi: str) -> str:
    """Normalize a DOI to a consistent lowercase format without URL prefix."""
    if not doi:
        return ""
    return doi.replace("https://doi.org/", "").strip().lower()


def get_paper_from_db(doi: str):
    """Fetch paper + metrics from Supabase if it exists."""

    ref = (
        supabase.table("reference")
        .select("*")
        .eq("doi", doi)
        .execute()
    )

    if not ref.data:
        return None

    paper = ref.data[0]

    metrics = (
        supabase.table("reference_metrics")
        .select("*")
        .eq("doi", doi)
        .execute()
    )

    paper["dimensions_metrics"] = metrics.data[0] if metrics.data else None

    return paper


def _enrich_paper(paper):

    if "error" in paper:
        return paper

    doi = paper.get("doi")

    if not doi:
        return paper

    clean_doi = doi.replace("https://doi.org/", "")

    # ---------------------------
    # 1. Check Supabase cache
    # ---------------------------
    db_paper = get_paper_from_db(clean_doi)

    if db_paper and db_paper.get("dimensions_metrics"):
        paper["abstract"] = db_paper.get("abstract")
        paper["year"] = db_paper.get("year")
        paper["author"] = db_paper.get("author")
        paper["dimensions_metrics"] = db_paper.get("dimensions_metrics")

        paper["source"] = "supabase_cache"
        return paper

    # ---------------------------
    # 2. Otherwise call APIs
    # ---------------------------
    cross_state = {
        "doi": clean_doi,
        "full_text": None,
        "download_url": None,
        "authors_metrics": [],
        "dimensions_metrics": None,
        "errors": []
    }

    try:
        cross_result = cross_ref_agent.invoke(cross_state)

        paper["metrics"] = cross_result.get("authors_metrics", [])
        paper["full_text"] = cross_result.get("full_text")
        paper["download_url"] = cross_result.get("download_url")
        paper["dimensions_metrics"] = cross_result.get("dimensions_metrics")

        paper["source"] = "api"

    except Exception as e:
        paper["cross_ref_error"] = str(e)

    return paper


# -------- Nodes -------- #

CANDIDATE_N = 25  # Papers sent to critic for scoring
FINAL_N = 5       # Papers returned after ranking


def extract_search_terms(query: str) -> str:
    """Single LLM call: convert one natural-language query into keywords."""
    llm = get_llm()
    prompt = f"""You are a research assistant. Extract the key academic search terms
from the following natural language query. Return ONLY the search terms
separated by spaces. No additional text or explanation.

Query: {query}

Search terms:"""
    response = llm.invoke([HumanMessage(content=prompt)])
    cleaned = response.content.strip()
    return cleaned if cleaned else query


def search_and_rank(state: AgentState) -> AgentState:
    """
    For each expanded query: extract keywords (1 LLM call each),
    search OpenAlex, count DOI frequency across all queries,
    pick top candidates, then enrich.
    """
    expanded_queries = state.get("expanded_queries", [])
    if not expanded_queries:
        expanded_queries = [state["user_query"]]

    # --- Phase 1: Extract keywords + search OpenAlex per query ---
    doi_count: Counter = Counter()
    paper_map: dict[str, dict] = {}  # normalized DOI → paper dict
    all_search_terms: list[str] = []

    for query in expanded_queries:
        # Extract keywords via LLM
        keywords = extract_search_terms(query)
        search_term = keywords.strip().replace(" ", "+")
        all_search_terms.append(search_term)

        results = search_openalex(search_term, per_page=7)
        for paper in results:
            if "error" in paper:
                continue
            doi = paper.get("doi", "")
            norm = _normalize_doi(doi)
            if not norm:
                continue
            doi_count[norm] += 1
            if norm not in paper_map:
                paper_map[norm] = paper

    # --- Phase 2: Rank by frequency, pick top candidates for critic ---
    ranked_dois = sorted(
        paper_map.keys(),
        key=lambda d: doi_count[d],
        reverse=True
    )[:CANDIDATE_N]

    top_papers = []
    for doi in ranked_dois:
        paper = paper_map[doi]
        paper["appearance_count"] = doi_count[doi]
        top_papers.append(paper)

    # --- Phase 3: Enrich only candidates in parallel ---
    with ThreadPoolExecutor(max_workers=min(CANDIDATE_N, 10)) as executor:
        futures = {executor.submit(_enrich_paper, p): p for p in top_papers}
        enriched = []
        for future in as_completed(futures):
            try:
                enriched.append(future.result())
            except Exception as e:
                paper = futures[future]
                paper["cross_ref_error"] = str(e)
                enriched.append(paper)

    search_terms = " | ".join(all_search_terms)

    return {**state, "results": enriched, "search_terms": search_terms}


from app.agent.critic_agent import critique_results

# -------- Graph -------- #

def create_research_agent():
    graph = StateGraph(AgentState)
    graph.add_node("search_and_rank", search_and_rank)
    graph.add_node("critique", critique_results)

    graph.add_edge("search_and_rank", "critique")
    graph.add_edge("critique", END)

    graph.set_entry_point("search_and_rank")
    return graph.compile()


agent = create_research_agent()
