from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Auth Schemas
class UserSignUp(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=1, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str
    expires_in: int
    user: dict


# User Profile Schemas
class UserProfileBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class UserProfileCreate(UserProfileBase):
    id: str  # UUID from auth.users


class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)


class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str
