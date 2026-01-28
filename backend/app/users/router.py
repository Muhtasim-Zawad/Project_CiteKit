from fastapi import APIRouter, Depends, HTTPException, status
from app.auth.dependencies import get_current_user, get_current_user_profile
from app.db.supabase import get_supabase
from app.schemas import UserProfileResponse, UserProfileUpdate, MessageResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(profile: dict = Depends(get_current_user_profile)):
    """
    Get the current authenticated user's profile.
    """
    return UserProfileResponse(
        id=profile["id"],
        email=profile["email"],
        name=profile["name"],
        created_at=profile.get("created_at"),
        updated_at=profile.get("updated_at")
    )


@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    profile_update: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update the current authenticated user's profile.
    Only updates the fields that are provided.
    """
    supabase = get_supabase()

    # Build update data (only non-None fields)
    update_data = {}
    if profile_update.name is not None:
        update_data["name"] = profile_update.name

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )

    try:
        response = supabase.table("profiles").update(update_data).eq(
            "id", current_user["id"]
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )

        updated_profile = response.data[0]

        return UserProfileResponse(
            id=updated_profile["id"],
            email=current_user["email"],
            name=updated_profile["name"],
            created_at=updated_profile.get("created_at"),
            updated_at=updated_profile.get("updated_at")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )



@router.delete("/me", response_model=MessageResponse)
async def delete_my_account(current_user: dict = Depends(get_current_user)):
    """
    Delete the current user's account.
    This will delete the profile and the auth user.
    Note: Requires admin key to delete auth user from server side.
    """
    supabase = get_supabase()

    try:
        # Delete profile first (due to foreign key constraint)
        supabase.table("profiles").delete().eq("id", current_user["id"]).execute()

        # Note: Deleting auth.users requires service_role key
        # This should be handled via Supabase admin API or database trigger

        return MessageResponse(
            message="Profile deleted. Please contact support to complete account deletion."
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting account: {str(e)}"
        )
