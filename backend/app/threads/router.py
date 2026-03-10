from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timezone
from app.db.supabase import get_supabase
from app.auth.dependencies import get_current_user
from app.schemas.thread import ThreadCreate, ThreadUpdate, ThreadResponse, ThreadSummary
from app.schemas.project import MessageResponse

router = APIRouter(prefix="/threads", tags=["Threads"])


@router.post("/", response_model=ThreadResponse)
async def create_thread(
    payload: ThreadCreate,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """Create a new thread under a project owned by the current user."""
    project_id = str(payload.project_id)

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

    now = datetime.now(timezone.utc).isoformat()
    resp = supabase.table("thread").insert({
        "project_id": project_id,
        "title": payload.title,
        "created_at": now,
        "updated_at": now,
    }).execute()

    if not resp.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create thread"
        )

    t = resp.data[0]
    return ThreadResponse(
        thread_id=t["thread_id"],
        project_id=t["project_id"],
        title=t.get("title"),
        summary=t.get("summary"),
        created_at=t["created_at"],
        updated_at=t["updated_at"],
    )


@router.get("/project/{project_id}", response_model=List[ThreadSummary])
async def get_project_threads(
    project_id: str,
    page: int = 1,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """Get threads for a project, paginated (3 per page), ordered by most recent."""
    PAGE_SIZE = 3

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

    offset = (page - 1) * PAGE_SIZE

    resp = supabase.table("thread") \
        .select("thread_id, title, summary, updated_at") \
        .eq("project_id", project_id) \
        .order("updated_at", desc=True) \
        .range(offset, offset + PAGE_SIZE - 1) \
        .execute()

    return [
        ThreadSummary(
            thread_id=t["thread_id"],
            title=t.get("title"),
            summary=t.get("summary"),
            updated_at=t["updated_at"],
        )
        for t in (resp.data or [])
    ]


@router.get("/{thread_id}", response_model=ThreadResponse)
async def get_thread(
    thread_id: str,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """Get a single thread by ID (verifies project ownership)."""
    thread = supabase.table("thread").select("*, projects!inner(user_id)") \
        .eq("thread_id", thread_id) \
        .execute()

    if not thread.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")

    t = thread.data[0]
    if t["projects"]["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")

    return ThreadResponse(
        thread_id=t["thread_id"],
        project_id=t["project_id"],
        title=t.get("title"),
        summary=t.get("summary"),
        created_at=t["created_at"],
        updated_at=t["updated_at"],
    )


@router.patch("/{thread_id}", response_model=ThreadResponse)
async def update_thread(
    thread_id: str,
    payload: ThreadUpdate,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """Update a thread's title."""
    # Verify ownership via join
    thread = supabase.table("thread").select("*, projects!inner(user_id)") \
        .eq("thread_id", thread_id) \
        .execute()

    if not thread.data or thread.data[0]["projects"]["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")

    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    resp = supabase.table("thread").update(update_data) \
        .eq("thread_id", thread_id) \
        .execute()

    if not resp.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update thread")

    t = resp.data[0]
    return ThreadResponse(
        thread_id=t["thread_id"],
        project_id=t["project_id"],
        title=t.get("title"),
        summary=t.get("summary"),
        created_at=t["created_at"],
        updated_at=t["updated_at"],
    )


@router.delete("/{thread_id}", response_model=MessageResponse)
async def delete_thread(
    thread_id: str,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """Delete a thread (cascades to its chats)."""
    # Verify ownership via join
    thread = supabase.table("thread").select("*, projects!inner(user_id)") \
        .eq("thread_id", thread_id) \
        .execute()

    if not thread.data or thread.data[0]["projects"]["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")

    supabase.table("thread").delete().eq("thread_id", thread_id).execute()

    return MessageResponse(message="Thread deleted successfully")
