import re
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END

from app.config import get_settings
from .query_expansion_class import QueryExpansionState

settings = get_settings()

# -------- Config -------- #

SYSTEM_PROMPT = (
    "You are an academic query expansion assistant. "
    "Given a user's search query and a summary of their research context, "
    "generate 4 to 6 alternative academic search queries optimized for "
    "academic search engines like OpenAlex and Semantic Scholar.\n\n"
    "Rules:\n"
    "- Each query should be concise (10–15 words max).\n"
    "- Include relevant synonyms, research methods, domain keywords, "
    "and dataset or application context.\n"
    "- Do NOT repeat the original query verbatim.\n"
    "- Return ONLY a numbered list (1. … 2. … etc.), no extra text.\n"
)


def get_llm():
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.5,
        api_key=settings.groq_api_key,
    )


# -------- Helpers -------- #

def _parse_queries(raw: str) -> list[str]:
    """Extract queries from a numbered list, deduplicate, and cap at 6."""
    lines = raw.strip().splitlines()
    queries: list[str] = []
    seen: set[str] = set()

    for line in lines:
        cleaned = re.sub(r"^\s*[\d]+[.)]\s*", "", line).strip("- ").strip()
        if not cleaned:
            continue
        key = cleaned.lower()
        if key not in seen:
            seen.add(key)
            queries.append(cleaned)

    return queries[:6]


# -------- Nodes -------- #

def expand_query_node(state: QueryExpansionState) -> QueryExpansionState:
    """LangGraph node: generate expanded queries from user query + research summary."""
    llm = get_llm()

    user_prompt = (
        f"Research context:\n{state['research_summary']}\n\n"
        f"User query:\n{state['user_query']}\n\n"
        "Generate expanded academic search queries:"
    )

    response = llm.invoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_prompt),
    ])

    return {**state, "expanded_queries": _parse_queries(response.content)}


# -------- Graph -------- #

def create_query_expansion_agent():
    graph = StateGraph(QueryExpansionState)
    graph.add_node("expand", expand_query_node)

    graph.add_edge("expand", END)

    graph.set_entry_point("expand")
    return graph.compile()


query_expansion_agent = create_query_expansion_agent()


# -------- Convenience wrapper -------- #

def expand_query(user_query: str, research_summary: str) -> list[str]:
    """
    Standalone helper: invoke the agent and return the expanded queries list.
    """
    state = {
        "user_query": user_query,
        "research_summary": research_summary,
        "expanded_queries": [],
    }
    result = query_expansion_agent.invoke(state)
    return result.get("expanded_queries", [])
