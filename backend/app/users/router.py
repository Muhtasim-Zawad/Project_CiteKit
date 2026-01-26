from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.auth.dependencies import get_current_user, get_current_user_profile
from app.db.supabase import get_supabase
from app.schemas import UserProfileResponse, UserProfileUpdate, MessageResponse
import uuid

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
        age=profile["age"],
        photo_url=profile.get("photo_url"),
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
    if profile_update.age is not None:
        update_data["age"] = profile_update.age
    if profile_update.photo_url is not None:
        update_data["photo_url"] = profile_update.photo_url

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
            age=updated_profile["age"],
            photo_url=updated_profile.get("photo_url"),
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


@router.post("/me/photo", response_model=UserProfileResponse)
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a profile photo for the current user.
    Uploads to Supabase Storage and updates the profile.
    """
    supabase = get_supabase()

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_types)}"
        )

    # Max file size: 5MB
    max_size = 5 * 1024 * 1024
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )

    try:
        # Generate unique filename
        file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
        file_name = f"{current_user['id']}/{uuid.uuid4()}.{file_ext}"

        # Upload to Supabase Storage (bucket: "avatars")
        storage_response = supabase.storage.from_("avatars").upload(
            path=file_name,
            file=content,
            file_options={"content-type": file.content_type}
        )

        # Get public URL
        public_url = supabase.storage.from_("avatars").get_public_url(file_name)

        # Update profile with new photo URL
        update_response = supabase.table("profiles").update({
            "photo_url": public_url
        }).eq("id", current_user["id"]).execute()

        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )

        updated_profile = update_response.data[0]

        return UserProfileResponse(
            id=updated_profile["id"],
            email=current_user["email"],
            name=updated_profile["name"],
            age=updated_profile["age"],
            photo_url=updated_profile.get("photo_url"),
            created_at=updated_profile.get("created_at"),
            updated_at=updated_profile.get("updated_at")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading photo: {str(e)}"
        )


@router.delete("/me/photo", response_model=MessageResponse)
async def delete_profile_photo(current_user: dict = Depends(get_current_user)):
    """
    Delete the current user's profile photo.
    """
    supabase = get_supabase()

    try:
        # Get current profile to find photo URL
        profile_response = supabase.table("profiles").select("photo_url").eq(
            "id", current_user["id"]
        ).single().execute()

        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )

        photo_url = profile_response.data.get("photo_url")

        if photo_url:
            # Extract file path from URL and delete from storage
            try:
                # Assuming URL format: https://xxx.supabase.co/storage/v1/object/public/avatars/user_id/filename
                if "/avatars/" in photo_url:
                    file_path = photo_url.split("/avatars/")[-1]
                    supabase.storage.from_("avatars").remove([file_path])
            except Exception:
                pass  # Continue even if storage deletion fails

        # Update profile to remove photo URL
        supabase.table("profiles").update({
            "photo_url": None
        }).eq("id", current_user["id"]).execute()

        return MessageResponse(message="Profile photo deleted successfully")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting photo: {str(e)}"
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
