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
        api_key=settings.groq_api_key  # 🔑 explicit, reliable
    )

# -------- Nodes -------- #

def extract_search_terms(state: AgentState) -> AgentState:

    llm = get_llm()
    """Extract relevant search terms from user query"""
    user_query = state["user_query"]
    
    prompt = f"""You are a research assistant. Extract the key search terms from the following query 
    that should be used to search an academic database. Return ONLY the search terms separated by spaces,
    no additional text or explanation.
    
    User query: {user_query}
    
    Search terms:"""

    response = llm.invoke([HumanMessage(content=prompt)])
    search_terms = response.content.strip().replace(" ", "+")

    return {**state, "search_terms": search_terms}


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
    # 1️⃣ Check Supabase cache
    # ---------------------------
    db_paper = get_paper_from_db(clean_doi)

    if db_paper:
        paper["abstract"] = db_paper.get("abstract")
        paper["year"] = db_paper.get("year")
        paper["author"] = db_paper.get("author")
        paper["dimensions_metrics"] = db_paper.get("dimensions_metrics")

        paper["source"] = "supabase_cache"
        return paper

    # ---------------------------
    # 2️⃣ Otherwise call APIs
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


def search_papers(state: AgentState) -> AgentState:
    results = search_openalex(state["search_terms"])
    
    # Enrich all papers in parallel — all cross-ref calls fire simultaneously
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(_enrich_paper, paper): paper for paper in results}
        enriched_results = []
        for future in as_completed(futures):
            try:
                enriched_results.append(future.result())
            except Exception as e:
                paper = futures[future]
                paper["cross_ref_error"] = str(e)
                enriched_results.append(paper)

    return {**state, "results": enriched_results}


from app.agent.critic_agent import critique_results

# -------- Graph -------- #

def create_research_agent():
    graph = StateGraph(AgentState)
    graph.add_node("extract", extract_search_terms)
    graph.add_node("search", search_papers)
    graph.add_node("critique", critique_results)

    graph.add_edge("extract", "search")
    graph.add_edge("search", "critique")
    graph.add_edge("critique", END)

    graph.set_entry_point("extract")
    return graph.compile()


agent = create_research_agent()
