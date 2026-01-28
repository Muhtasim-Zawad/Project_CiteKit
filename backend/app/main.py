from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.projects.router import router as projects_router
from app.config import get_settings
from app.agent.router import router as agent_router

settings = get_settings()

app = FastAPI(
    title="CiteKit API",
    description="Modular FastAPI backend with Supabase integration",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(projects_router)
app.include_router(agent_router)

@app.get("/")
async def root():
    return {
        "message": "CiteKit API",
        "docs": "/docs",
        "version": "1.0.0"
    }



@app.get("/health")
async def health_check():
    return {"status": "healthy"}
