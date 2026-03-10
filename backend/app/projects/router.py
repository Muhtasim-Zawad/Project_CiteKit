from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timezone
from app.db.supabase import get_supabase
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectSummary, ReferenceCreate, ReferenceResponse, MessageResponse
from app.auth.dependencies import get_current_user
from app.schemas.chat_result import ChatResultResponse

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Create a new project for the current authenticated user.
    """
    now = datetime.now(timezone.utc).isoformat()
    try:
        response = supabase.table("projects").insert({
            "title": project.title,
            "description": project.description,
            "user_id": current_user["id"],  
            "created_at": now,
            "updated_at": now
        }).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create project"
            )

        project_id = response.data[0]["project_id"]

        return ProjectResponse(
            project_id=project_id,
            title=project.title,
            description=project.description,
            user_id=current_user["id"],
            created_at=now,
            updated_at=now,
            references=[]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating project: {str(e)}"
        )


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project: ProjectUpdate,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Update a project owned by the current user.
    """
    try:
        update_data = project.model_dump(exclude_none=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        response = supabase.table("projects").update(update_data) \
            .eq("project_id", project_id) \
            .eq("user_id", current_user["id"]) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or not owned by user"
            )

        p = response.data[0]
        return ProjectResponse(
            project_id=p["project_id"],
            title=p["title"],
            description=p.get("description"),
            user_id=p["user_id"],
            created_at=p["created_at"],
            updated_at=p["updated_at"],
            references=[]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating project: {str(e)}"
        )


@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Delete a project owned by the current user.
    """
    try:
        response = supabase.table("projects").delete() \
            .eq("project_id", project_id) \
            .eq("user_id", current_user["id"]) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or not owned by user"
            )

        return MessageResponse(message="Project deleted successfully")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting project: {str(e)}"
        )


@router.post("/{project_id}/references", response_model=ReferenceResponse)
async def add_reference_to_project(
    project_id: str,
    reference: ReferenceCreate,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Add a reference to a project owned by the current user.
    Creates the reference if it does not exist.
    """
    now = datetime.now(timezone.utc).isoformat()
    try:
        project = supabase.table("projects").select("*") \
            .eq("project_id", project_id) \
            .eq("user_id", current_user["id"]).execute()

        if not project.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or not owned by user"
            )

        # Upsert reference
        supabase.table("reference").upsert({
            "doi": reference.doi,
            "title": reference.title,
            "author": reference.author,
            "abstract": reference.abstract
        }).execute()

        # Link reference to project
        supabase.table("project_reference").insert({
            "project_id": project_id,
            "doi": reference.doi,
            "add_time": now
        }).execute()

        return reference

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding reference: {str(e)}"
        )


@router.delete("/{project_id}/references/{doi}", response_model=MessageResponse)
async def delete_reference_from_project(
    project_id: str,
    doi: str,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Remove a reference from a project owned by the current user.
    """
    try:

        project = supabase.table("projects").select("*") \
            .eq("project_id", project_id) \
            .eq("user_id", current_user["id"]).execute()

        if not project.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or not owned by user"
            )

        # Delete link in junction table
        supabase.table("project_reference").delete() \
            .eq("project_id", project_id).eq("doi", doi).execute()

        return MessageResponse(message=f"Reference {doi} removed from project {project_id}")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing reference: {str(e)}"
        )


@router.get("/recent", response_model=List[ProjectSummary])
async def get_recent_projects(
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Get the 10 most recently updated projects for the current user.
    """
    try:
        response = supabase.table("projects") \
            .select("project_id, title, description, updated_at") \
            .eq("user_id", current_user["id"]) \
            .order("updated_at", desc=True) \
            .limit(10) \
            .execute()

        return [
            ProjectSummary(
                project_id=p["project_id"],
                title=p["title"],
                description=p.get("description"),
                updated_at=p["updated_at"]
            )
            for p in (response.data or [])
        ]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching recent projects: {str(e)}"
        )


@router.get("/", response_model=List[ProjectSummary])
async def get_user_projects(
    page: int = 1,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Get paginated projects for the current authenticated user.
    Returns 10 projects per page, ordered by created_at descending.
    """
    try:
        limit = 10
        offset = (page - 1) * limit

        projects_resp = supabase.table("projects") \
            .select("project_id, title, description, updated_at") \
            .eq("user_id", current_user["id"]) \
            .order("created_at", desc=True) \
            .range(offset, offset + limit - 1) \
            .execute()

        return [
            ProjectSummary(
                project_id=p["project_id"],
                title=p["title"],
                description=p.get("description"),
                updated_at=p["updated_at"],
            )
            for p in (projects_resp.data or [])
        ]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user projects: {str(e)}"
        )

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Get a specific project by ID for the current authenticated user,
    including all references.
    """
    try:
        # Fetch project and verify ownership
        project_resp = supabase.table("projects").select("*") \
            .eq("project_id", project_id) \
            .eq("user_id", current_user["id"]).execute()

        if not project_resp.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or not owned by user"
            )

        project = project_resp.data[0]

        # Fetch references linked to this project
        references_resp = supabase.table("project_reference").select(
            "doi, add_time, reference(*)"
        ).eq("project_id", project_id).execute()

        references_list = []
        if references_resp.data:
            for item in references_resp.data:
                ref_data = item.get("reference", {})
                references_list.append(
                    ReferenceResponse(
                        doi=item["doi"],
                        title=ref_data.get("title"),
                        author=ref_data.get("author"),
                        abstract=ref_data.get("abstract"),
                        add_time=item["add_time"]  # ISO string
                    )
                )

        # Return project with references
        return ProjectResponse(
            project_id=project["project_id"],
            title=project.get("title"),
            description=project.get("description"),
            user_id=project.get("user_id"),
            created_at=project.get("created_at"),
            updated_at=project.get("updated_at"),
            references=references_list
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching project: {str(e)}"
        )

@router.post("/{project_id}/add-reference/{doi:path}", response_model=MessageResponse)
async def link_reference_to_project(
    project_id: str,
    doi: str,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Link an existing reference to a project using DOI.
    Only inserts into project_reference table.
    """

    try:
        project = supabase.table("projects").select("project_id") \
            .eq("project_id", project_id) \
            .eq("user_id", current_user["id"]) \
            .execute()

        if not project.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or not owned by user"
            )

        doi = doi.replace("https://doi.org/", "").strip().lower()

        supabase.table("project_reference").upsert({
            "project_id": project_id,
            "doi": doi,
            "add_time": datetime.now(timezone.utc).isoformat()
        }).execute()

        return MessageResponse(
            message=f"Reference {doi} linked to project {project_id}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error linking reference: {str(e)}"
        )
    
@router.get("/{project_id}/references", response_model=List[ChatResultResponse])
async def get_project_references(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Get all references for a project with full details
    including score, critic reasoning, metrics, full text, download url.
    """
    # Verify project ownership
    project_resp = supabase.table("projects").select("*") \
        .eq("project_id", project_id) \
        .eq("user_id", current_user["id"]).execute()

    if not project_resp.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not owned by user"
        )

    # Fetch all references linked to this project
    project_refs_resp = supabase.table("project_reference").select(
        """
        doi,
        add_time,
        chat_results(
            id,
            score,
            critic_reasoning,
            full_text,
            download_url,
            dimensions_metrics,
            reference(title, author, abstract, year)
        )
        """
    ).eq("project_id", project_id).execute()

    references = []

    for item in (project_refs_resp.data or []):
        # Each project_reference can have multiple chat_results
        chat_results = item.get("chat_results") or []
        for r in chat_results:
            ref = r.get("reference") or {}
            references.append(ChatResultResponse(
                id=r.get("id"),
                doi=item["doi"],
                title=ref.get("title"),
                author=ref.get("author"),
                abstract=ref.get("abstract"),
                year=ref.get("year"),
                score=r.get("score"),
                critic_reasoning=r.get("critic_reasoning"),
                full_text=r.get("full_text"),
                download_url=r.get("download_url"),
                dimensions_metrics=r.get("dimensions_metrics")
            ))

    return references