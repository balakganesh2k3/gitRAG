from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
from supabase import create_client
from typing import Dict, List, Optional
import os
import uuid
from pydantic import BaseModel

# Import configurations
from backend.config import (
    CORS_ORIGINS,
    RATE_LIMIT,
    SUPABASE_URL,
    SUPABASE_KEY,
    REDIS_URL
)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="GitRAG API")

# Configure rate limiter with fallback
try:
    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=[RATE_LIMIT],
        storage_uri=REDIS_URL
    )
except Exception as e:
    print(f"Warning: Rate limiting disabled - {str(e)}")
    limiter = Limiter(key_func=get_remote_address)

app.state.limiter = limiter

# Add CORS middleware before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,  # Properly configured origins
    allow_credentials=True,  # Needed if using cookies or authentication
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose headers for client-side access
    max_age=3600,
)

app.add_middleware(SlowAPIMiddleware)

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Add rate limit exceeded handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/health")
@limiter.limit("10/minute")
async def health_check(request: Request) -> Dict[str, str]:
    return {"status": "healthy"}

class Repository(BaseModel):
    repo_url: str
    private: bool = False
    pat_token: Optional[str] = None

@app.post("/repositories/add")
@limiter.limit("5/minute")
async def add_repository(request: Request, repo: Repository):
    try:
        repo_id = str(uuid.uuid4())
        repo_data = {
            "id": repo_id,
            "repo_url": repo.repo_url,
            "private": repo.private,
            "pat_token": repo.pat_token,
            "status": "processing"
        }
        result = supabase.table("repositories").insert(repo_data).execute()
        
        return {"message": "Repository added successfully", "repo_id": repo_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/repositories")
@limiter.limit("10/minute")
async def list_repositories(request: Request):
    response = supabase.table("repositories").select("*").execute()
    return response.data

@app.delete("/repositories/{repo_id}")
@limiter.limit("5/minute")
async def delete_repository(request: Request, repo_id: str):
    response = supabase.table("repositories").delete().eq("id", repo_id).execute()
    if response.error:
        raise HTTPException(status_code=500, detail="Failed to delete repository")
    return {"message": "Repository deleted"}

@app.get("/repositories/{repo_id}")
async def get_repository(repo_id: str):
    try:
        result = supabase.table("repositories").select("*").eq("id", repo_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Repository not found")
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.options("/{path:path}")
async def options_handler(request: Request):
    return JSONResponse(
        status_code=200,
        content={"message": "OK"},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests"},
            headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*")}
        )
    
    error_msg = str(exc)
    status_code = 500
    
    if isinstance(exc, HTTPException):
        status_code = exc.status_code
        error_msg = exc.detail
        
    return JSONResponse(
        status_code=status_code,
        content={"detail": error_msg},
        headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*")}
    )
