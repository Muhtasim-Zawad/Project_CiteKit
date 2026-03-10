from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.db.supabase import get_supabase
from app.auth.dependencies import get_current_user
from app.schemas.chat import ChatCreate, ChatResponse, ChatMessage
from app.schemas.chat_result import ChatResultResponse
from app.agent.Librarian_agent import agent

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse)
async def create_chat(
    payload: ChatCreate,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Create a chat under a project and run the full research pipeline.
    Stores references, chat results, and reference metrics from the agent.
    """
    project_id = str(payload.project_id)

    # 1. Verify project belongs to user
    project = supabase.table("projects").select("project_id") \
        .eq("project_id", project_id) \
        .eq("user_id", current_user["id"]) \
        .execute()

    if not project.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not owned by user"
        )

    # 2. Run the librarian agent pipeline (search → cross-ref → critic)
    state = {
        "user_query": payload.query,
        "search_terms": "",
        "results": []
    }
    try:
        final_state = agent.invoke(state)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent pipeline failed: {str(e)}"
        )

    search_terms = final_state.get("search_terms", "")
    papers = final_state.get("results", [])

    # 3. Create the chat entry
    chat_resp = supabase.table("chat").insert({
        "project_id": project_id,
        "query": payload.query,
        "search_terms": search_terms
    }).execute()

    if not chat_resp.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create chat entry"
        )

    chat_row = chat_resp.data[0]
    chat_id = chat_row["id"]

    # 4. Process each paper
    result_responses: List[ChatResultResponse] = []

    for paper in papers:
        if "error" in paper:
            continue

        doi = paper.get("doi")
        if not doi:
            continue

        doi = doi.replace("https://doi.org/", "").strip().lower()
        title = paper.get("title", "Untitled")
        abstract = paper.get("abstract")
        year = paper.get("year")
        score = paper.get("score")
        critic_reasoning = paper.get("critic_reasoning")
        full_text = paper.get("full_text")
        download_url = paper.get("download_url")
        dimensions_metrics = paper.get("dimensions_metrics")
        # Get author names: prefer direct field from OpenAlex search, fallback to metrics
        author_names = paper.get("author")
        if not author_names:
            author_metrics_list = paper.get("metrics", [])
            author_names = ", ".join(
                m.get("name", "") for m in author_metrics_list if m.get("name")
            ) or None

        # Normalize year to int or None
        if isinstance(year, str):
            try:
                year = int(year)
            except (ValueError, TypeError):
                year = None

        # 4a. Upsert into reference table
        ref_data = {
            "doi": doi,
            "title": title,
            "author": author_names,
            "abstract": abstract,
        }
        if year is not None:
            ref_data["year"] = year

        supabase.table("reference").upsert(ref_data).execute()

        # 4c. Create chat_result entry
        chat_result_data = {
            "chat_id": chat_id,
            "doi": doi,
            "score": score,
            "critic_reasoning": critic_reasoning,
        }
        cr_resp = supabase.table("chat_results").insert(chat_result_data).execute()
        if not cr_resp.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create chat result entry"
            )
        chat_result_id = cr_resp.data[0]["id"]

        # 4d. Upsert reference_metrics (from dimensions_metrics)
        if dimensions_metrics:
            metrics_data = {
                "doi": doi,
                "times_cited": dimensions_metrics.get("times_cited"),
                "recent_citations": dimensions_metrics.get("recent_citations"),
                "relative_citation_ratio": dimensions_metrics.get("relative_citation_ratio"),
                "field_citation_ratio": dimensions_metrics.get("field_citation_ratio"),
            }
            supabase.table("reference_metrics").upsert(metrics_data).execute()

        # Build response item
        result_responses.append(ChatResultResponse(
            id=chat_result_id,
            doi=doi,
            title=title,
            author=author_names,
            abstract=abstract,
            year=year,
            score=score,
            critic_reasoning=critic_reasoning,
            full_text=full_text,
            download_url=download_url,
            dimensions_metrics=dimensions_metrics,
        ))

    return ChatResponse(
        id=chat_id,
        project_id=payload.project_id,
        query=payload.query,
        search_terms=search_terms,
        created_at=chat_row.get("created_at"),
        results=result_responses,
    )


@router.get("/{project_id}", response_model=List[ChatResponse])
async def get_project_chats(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Get all chats for a project with full results, ordered by created_at ascending.
    """
    # Verify project ownership
    project = supabase.table("projects").select("project_id") \
        .eq("project_id", project_id) \
        .eq("user_id", current_user["id"]) \
        .execute()

    if not project.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not owned by user"
        )

    # Fetch all chats for the project ordered by created_at
    chats_resp = supabase.table("chat").select("*") \
        .eq("project_id", project_id) \
        .order("created_at") \
        .execute()

    if not chats_resp.data:
        return []

    chat_responses = []

    for chat in chats_resp.data:
        chat_id = chat["id"]

        # Fetch chat results with joined reference data
        results_resp = supabase.table("chat_results").select(
            "id, doi, score, critic_reasoning, reference(title, author, abstract, year)"
        ).eq("chat_id", chat_id).execute()

        result_items = []
        for r in (results_resp.data or []):
            ref = r.get("reference") or {}
            doi = r["doi"]

            # Fetch reference_metrics for this doi
            metrics_resp = supabase.table("reference_metrics").select("*") \
                .eq("doi", doi).execute()
            dim_metrics = None
            if metrics_resp.data:
                m = metrics_resp.data[0]
                dim_metrics = {
                    "times_cited": m.get("times_cited"),
                    "recent_citations": m.get("recent_citations"),
                    "relative_citation_ratio": m.get("relative_citation_ratio"),
                    "field_citation_ratio": m.get("field_citation_ratio"),
                }

            result_items.append(ChatResultResponse(
                id=r.get("id"),
                doi=doi,
                title=ref.get("title"),
                author=ref.get("author"),
                abstract=ref.get("abstract"),
                year=ref.get("year"),
                score=r.get("score"),
                critic_reasoning=r.get("critic_reasoning"),
                dimensions_metrics=dim_metrics,
            ))

        chat_responses.append(ChatResponse(
            id=chat_id,
            project_id=chat["project_id"],
            query=chat["query"],
            search_terms=chat.get("search_terms"),
            created_at=chat.get("created_at"),
            results=result_items,
        ))

    return chat_responses


@router.get("/{project_id}/{chat_id}", response_model=ChatResponse)
async def get_chat_detail(
    project_id: str,
    chat_id: int,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Get a single chat with full results (papers, metrics, etc.).
    """
    # Verify project ownership
    project = supabase.table("projects").select("project_id") \
        .eq("project_id", project_id) \
        .eq("user_id", current_user["id"]) \
        .execute()

    if not project.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not owned by user"
        )

    # Fetch the chat
    chat_resp = supabase.table("chat").select("*") \
        .eq("id", chat_id) \
        .eq("project_id", project_id) \
        .execute()

    if not chat_resp.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )

    chat = chat_resp.data[0]

    # Fetch chat results with joined reference data
    results_resp = supabase.table("chat_results").select(
        "id, doi, score, critic_reasoning, reference(title, author, abstract, year)"
    ).eq("chat_id", chat_id).execute()

    result_items = []
    for r in (results_resp.data or []):
        ref = r.get("reference") or {}
        doi = r["doi"]

        # Fetch reference_metrics for this doi
        metrics_resp = supabase.table("reference_metrics").select("*") \
            .eq("doi", doi).execute()
        dim_metrics = None
        if metrics_resp.data:
            m = metrics_resp.data[0]
            dim_metrics = {
                "times_cited": m.get("times_cited"),
                "recent_citations": m.get("recent_citations"),
                "relative_citation_ratio": m.get("relative_citation_ratio"),
                "field_citation_ratio": m.get("field_citation_ratio"),
            }

        result_items.append(ChatResultResponse(
            id=r.get("id"),
            doi=doi,
            title=ref.get("title"),
            author=ref.get("author"),
            abstract=ref.get("abstract"),
            year=ref.get("year"),
            score=r.get("score"),
            critic_reasoning=r.get("critic_reasoning"),
            dimensions_metrics=dim_metrics,
        ))

    return ChatResponse(
        id=chat_id,
        project_id=chat["project_id"],
        query=chat["query"],
        search_terms=chat.get("search_terms"),
        created_at=chat.get("created_at"),
        results=result_items,
    )
