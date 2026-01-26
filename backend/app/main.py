from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.config import get_settings
import os

settings = get_settings()

app = FastAPI(
    title="CiteKit Authentication API",
    description="FastAPI backend with Supabase authentication and user management",
    version="1.0.0"
)

# CORS middleware configuration - allow all for testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)


@app.get("/")
async def root():
    return {
        "message": "CiteKit Authentication API",
        "docs": "/docs",
        "test": "/test",
        "version": "1.0.0"
    }


@app.get("/test")
async def test_page():
    """Serve the test HTML page for testing authentication"""
    file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "test.html")
    return FileResponse(file_path, media_type="text/html")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
