import requests
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from .Librarian_class import AgentState
from app.config import get_settings
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
            
            results.append({
                'title': title,
                'doi': doi,
                'year': year,
                'abstract': abstract_text
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


def search_papers(state: AgentState) -> AgentState:
    results = search_openalex(state["search_terms"])
    return {**state, "results": results}


# -------- Graph -------- #

def create_research_agent():
    graph = StateGraph(AgentState)
    graph.add_node("extract", extract_search_terms)
    graph.add_node("search", search_papers)

    graph.add_edge("extract", "search")
    graph.add_edge("search", END)

    graph.set_entry_point("extract")
    return graph.compile()


agent = create_research_agent()
