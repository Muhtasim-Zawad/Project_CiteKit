from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timezone
from app.db.supabase import get_supabase
from app.schemas import ProjectCreate, ProjectResponse, ReferenceCreate, ReferenceResponse, MessageResponse
from app.auth.dependencies import get_current_user

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


@router.get("/", response_model=List[ProjectResponse])
async def get_user_projects(
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase)
):
    """
    Get all projects for the current authenticated user, including their references.
    """
    try:
        # Fetch all projects for the user
        projects_resp = supabase.table("projects").select("*") \
            .eq("user_id", current_user["id"]).execute()

        if not projects_resp.data:
            return []

        projects_list = []

        for project in projects_resp.data:
            project_id = project["project_id"]

            # Fetch references for this project
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
                            add_time=item["add_time"]  # should already be ISO string
                        )
                    )

            # Append project with references
            projects_list.append(
                ProjectResponse(
                    project_id=project_id,
                    title=project.get("title"),
                    user_id=project.get("user_id"),
                    created_at=project.get("created_at"),
                    updated_at=project.get("updated_at"),
                    references=references_list
                )
            )

        return projects_list

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
