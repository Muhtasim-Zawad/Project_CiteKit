from fastapi import APIRouter, HTTPException, status
from app.db.supabase import get_supabase
from app.config import get_settings
from app.schemas import (
    UserSignUp,
    UserLogin,
    TokenResponse,
    MessageResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignUp):
    """
    Register a new user with email/password and create their profile.
    Collects name, age, and optional photo during signup.
    Profile is auto-created via database trigger using the user metadata.
    """
    supabase = get_supabase()

    try:
        # Sign up user with Supabase Auth - store user data in metadata
        # The database trigger will auto-create the profile from this metadata
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "name": user_data.name,
                    "age": user_data.age,
                    "photo_url": user_data.photo_url
                }
            }
        })

        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )

        user_id = auth_response.user.id

        if auth_response.session:
            return TokenResponse(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                expires_in=auth_response.session.expires_in,
                user={
                    "id": user_id,
                    "email": user_data.email,
                    "name": user_data.name,
                    "age": user_data.age,
                    "photo_url": user_data.photo_url
                }
            )
        else:
            # Email confirmation is required
            return TokenResponse(
                access_token="",
                refresh_token="",
                expires_in=0,
                user={
                    "id": user_id,
                    "email": user_data.email,
                    "name": user_data.name,
                    "age": user_data.age,
                    "photo_url": user_data.photo_url,
                    "message": "Please check your email to confirm your account"
                }
            )

    except HTTPException:
        raise
    except Exception as e:
        error_message = str(e)
        if "already registered" in error_message.lower() or "already exists" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during signup: {error_message}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login with email and password.
    Returns access token and user profile information.
    """
    supabase = get_supabase()

    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })

        if auth_response.user is None or auth_response.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Fetch user profile
        profile_response = supabase.table("profiles").select("*").eq(
            "id", auth_response.user.id
        ).single().execute()

        profile = profile_response.data if profile_response.data else {}

        return TokenResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            expires_in=auth_response.session.expires_in,
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": profile.get("name", ""),
                "age": profile.get("age", 0),
                "photo_url": profile.get("photo_url")
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        error_message = str(e)
        if "invalid" in error_message.lower() or "credentials" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        if "email not confirmed" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Please confirm your email before logging in. Check your inbox for the confirmation link."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during login: {error_message}"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """
    Refresh the access token using refresh token.
    """
    supabase = get_supabase()

    try:
        auth_response = supabase.auth.refresh_session(refresh_token)

        if auth_response.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Fetch user profile
        profile_response = supabase.table("profiles").select("*").eq(
            "id", auth_response.user.id
        ).single().execute()

        profile = profile_response.data if profile_response.data else {}

        return TokenResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            expires_in=auth_response.session.expires_in,
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": profile.get("name", ""),
                "age": profile.get("age", 0),
                "photo_url": profile.get("photo_url")
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error refreshing token: {str(e)}"
        )


@router.post("/logout", response_model=MessageResponse)
async def logout():
    """
    Logout the current user.
    Note: This invalidates the session on Supabase side.
    """
    supabase = get_supabase()

    try:
        supabase.auth.sign_out()
        return MessageResponse(message="Successfully logged out")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during logout: {str(e)}"
        )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(email: str):
    """
    Send password reset email.
    """
    supabase = get_supabase()

    try:
        supabase.auth.reset_password_email(
            email,
            options={
                "redirect_to": f"{settings.frontend_url}/auth/reset-password"
            }
        )
        return MessageResponse(message="Password reset email sent")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending reset email: {str(e)}"
        )


@router.post("/resend-confirmation", response_model=MessageResponse)
async def resend_confirmation(email: str):
    """
    Resend email confirmation link.
    """
    supabase = get_supabase()

    try:
        supabase.auth.resend(
            type="signup",
            email=email
        )
        return MessageResponse(message="Confirmation email sent. Please check your inbox.")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending confirmation email: {str(e)}"
        )
