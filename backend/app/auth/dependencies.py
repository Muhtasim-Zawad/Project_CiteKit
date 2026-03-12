# app/dependencies/auth.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from functools import lru_cache
from app.config import get_settings, Settings
from app.db.supabase import get_supabase
import httpx

# Dependencies
security = HTTPBearer()
settings: Settings = get_settings()
JWKS_CACHE = None  # Cache the JWKs to avoid fetching each request

# -----------------------------
# Fetch Supabase JWKs
# -----------------------------
async def get_jwks():
    global JWKS_CACHE
    if JWKS_CACHE is None:
        async with httpx.AsyncClient() as client:
            url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
            resp = await client.get(url)
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Could not fetch Supabase JWKs"
                )
            JWKS_CACHE = resp.json()
    return JWKS_CACHE

# -----------------------------
# Get current user (verify JWT)
# -----------------------------
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    jwks = await get_jwks()
    try:
        # Verify ES256 token using Supabase JWKs
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["ES256"],
            audience="authenticated"
        )

        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        role: str = payload.get("role", "authenticated")

        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {
            "id": user_id,
            "email": email,
            "role": role,
            "payload": payload
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# -----------------------------
# Get current user profile
# -----------------------------
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Fetch the current user's profile from Supabase "profiles" table
    """
    supabase = get_supabase()
    try:
        response = (
            supabase.table("profiles")
            .select("*")
            .eq("id", current_user["id"])
            .single()
            .execute()
        )

        if response.data:
            return {
                **response.data,
                "email": current_user["email"],
                "role": current_user["role"]
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
    except Exception as e:
        if "404" in str(e).lower() or "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user profile: {str(e)}"
        )
