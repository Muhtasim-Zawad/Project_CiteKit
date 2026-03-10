from langchain_core.messages import HumanMessage
from app.agent.critic_class import CriticResponse
from app.agent.Librarian_class import AgentState
from app.config import get_settings
from langchain_groq import ChatGroq
import json

settings = get_settings()

FINAL_N = 5          # Final papers to return
CRITIC_WEIGHT = 0.7  # 70% critic score
FREQ_WEIGHT = 0.3    # 30% frequency score


def get_critic_llm():
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0,
        api_key=settings.groq_api_key
    )


def _compute_rank_score(paper: dict, max_count: int) -> float:
    """rank_score = (critic_score * 0.7) + (normalized_frequency * 0.3)"""
    critic_score = paper.get("score", 0)
    appearance = paper.get("appearance_count", 1)
    freq_normalized = (appearance / max_count * 100) if max_count > 0 else 0
    return (critic_score * CRITIC_WEIGHT) + (freq_normalized * FREQ_WEIGHT)


def critique_results(state: AgentState) -> AgentState:
    """Evaluate and score the relevance of retrieved papers against the original query."""
    user_query = state.get("user_query", "")
    results = state.get("results", [])

    if not results:
        return state

    # Prepare a prompt with the query and the papers
    papers_context = []
    for paper in results:
        doi = paper.get("doi", "N/A")
        title = paper.get("title", "N/A")
        abstract = paper.get("abstract", "N/A")
        papers_context.append(f"DOI: {doi}\nTitle: {title}\nAbstract: {abstract}\n---")

    papers_text = "\n".join(papers_context)

    prompt = f"""You are an expert academic research assistant and critical reviewer.
Your task is to evaluate a list of academic papers based on how well they answer the user's original query.

User Query: "{user_query}"

Papers:
{papers_text}

For each paper, assign a relevance score from 0 to 100, where 100 perfectly addresses the user's query and 0 is completely irrelevant. 
Provide a very brief 1-sentence reasoning for your score. 
Output your response matching the requested JSON structure exactly. Ensure every paper has a score and a corresponding DOI.
"""

    llm = get_critic_llm()
    structured_llm = llm.with_structured_output(CriticResponse)

    try:
        response = structured_llm.invoke([HumanMessage(content=prompt)])

        # Map scores back to the results list
        score_map = {item.doi: {"score": item.score, "reasoning": item.critic_reasoning} for item in response.scored_papers}

        for paper in results:
            doi = paper.get("doi")
            if doi and doi in score_map:
                paper["score"] = score_map[doi]["score"]
                paper["critic_reasoning"] = score_map[doi]["reasoning"]
            else:
                paper["score"] = 0
                paper["critic_reasoning"] = "Not scored by critic."

        # Apply ranking formula: 70% critic + 30% frequency
        max_count = max((p.get("appearance_count", 1) for p in results), default=1)
        for paper in results:
            paper["rank_score"] = round(_compute_rank_score(paper, max_count), 2)

        results.sort(key=lambda x: x.get("rank_score", 0), reverse=True)

        # Keep only final 5
        results = results[:FINAL_N]

    except Exception as e:
        # If Groq fails, fall back to frequency-only ranking
        for paper in results:
            paper["score"] = 0
            paper["rank_score"] = 0
            paper["critic_reasoning"] = f"Critic agent failed: {str(e)}"
        results = results[:FINAL_N]

    return {**state, "results": results}
