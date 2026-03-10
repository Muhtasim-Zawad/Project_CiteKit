from groq import Groq
from app.config import get_settings

settings = get_settings()
_client = Groq(api_key=settings.groq_api_key)

SUMMARY_SYSTEM_PROMPT = (
    "You are a research intent summarizer. "
    "Below are all search queries a researcher used while exploring papers. "
    "Summarize the overall research topic and intent in 1–2 sentences.\n\n"
    "The summary should capture:\n"
    "- main research topic\n"
    "- methods or models mentioned\n"
    "- datasets or domain focus\n"
    "- time constraints if mentioned\n\n"
    "Be concise and specific. Do not include any preamble."
)


def fetch_chat_queries(supabase, project_id: str) -> list[str]:
    """Fetch all chat queries for a project, ordered by creation time."""
    resp = (
        supabase.table("chat")
        .select("query")
        .eq("project_id", project_id)
        .order("created_at")
        .execute()
    )
    return [row["query"] for row in (resp.data or [])]


def build_conversation_history(queries: list[str]) -> str:
    """Combine queries into a numbered conversation history string."""
    return "\n".join(f"{i + 1}. {q}" for i, q in enumerate(queries))


def generate_summary_from_queries(queries: list[str]) -> str:
    """Send the conversation history to Groq and return the summary."""
    history = build_conversation_history(queries)
    response = _client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
            {"role": "user", "content": history},
        ],
        temperature=0.3,
        max_tokens=256,
    )
    return response.choices[0].message.content.strip()


def update_project_summary(supabase, project_id: str, summary: str) -> None:
    """Write the generated summary back to the projects table."""
    supabase.table("projects").update({"summary": summary}).eq(
        "project_id", project_id
    ).execute()


def generate_and_store_summary(supabase, project_id: str) -> str | None:
    """
    End-to-end: fetch queries → generate summary → persist it.
    Returns the summary string, or None if no chats exist.
    """
    queries = fetch_chat_queries(supabase, project_id)
    if not queries:
        return None
    summary = generate_summary_from_queries(queries)
    update_project_summary(supabase, project_id, summary)
    return summary
