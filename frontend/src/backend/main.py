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
import asyncio
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.rag_pipeline import processDocument  # Add this import
from backend.fetchgit import process_and_store_files

# Import configurations
from backend.config import (
    CORS_ORIGINS,
    RATE_LIMIT,
    SUPABASE_URL,
    SUPABASE_KEY,
    REDIS_URL
)
from backend.celery_app import celery_app
from backend.tasks import index_repo

# Load environment variables
load_dotenv()

# Configure rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[RATE_LIMIT],
    storage_uri=REDIS_URL
)

# Initialize FastAPI app
app = FastAPI(title="GitRAG API")
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# Update CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

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
        # Create repository record
        repo_id = str(uuid.uuid4())
        repo_data = {
            "id": repo_id,
            "repo_url": repo.repo_url,
            "private": repo.private,
            "pat_token": repo.pat_token,
            "status": "processing"
        }
        result = supabase.table("repositories").insert(repo_data).execute()
        
        # Process repository files
        try:
            files = process_and_store_files(repo.repo_url, repo.pat_token)
            
            # Store files and their embeddings
            for file in files:
                doc_data = {
                    "repository_id": repo_id,
                    "file_name": file["name"],
                    "content": file["content"],
                    "embedding": file["embedding"]
                }
                supabase.table("documents").insert(doc_data).execute()
            
            # Update repository status to ready
            supabase.table("repositories").update(
                {"status": "ready"}
            ).eq("id", repo_id).execute()
            
        except Exception as e:
            # Update repository status to error
            supabase.table("repositories").update({
                "status": "error",
                "error_message": str(e)
            }).eq("id", repo_id).execute()
            raise HTTPException(status_code=500, detail=str(e))
        
        # Queue the indexing task
        index_repo.delay(repo_id)
        
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

@app.post("/repositories/{repo_id}/process")
@limiter.limit("2/minute")
async def process_repository(request: Request, repo_id: str):
    try:
        # Get repository from database
        repo = supabase.table("repositories").select("*").eq("id", repo_id).single().execute()
        
        if not repo.data:
            raise HTTPException(status_code=404, detail="Repository not found")
            
        # Update status to processing
        supabase.table("repositories").update({"status": "processing"}).eq("id", repo_id).execute()
        
        # Start background task for processing
        process_repository_task.delay(repo_id)
        
        return {"message": "Repository processing started"}    
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/repositories/{repo_id}/status")
@limiter.limit("10/minute")
async def get_status(request: Request, repo_id: str):
    response = supabase.table("repositories").select("status").eq("id", repo_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Repository not found")
    return response.data[0]

# Celery task for background processing
@celery_app.task(name="process_repository")
def process_repository_task(repo_id: str):
    try:
        # Get repository details from database
        repo = supabase.table("repositories").select("*").eq("id", repo_id).single().execute()
        if not repo.data:
            raise Exception("Repository not found")
            
        # Fetch files from GitHub
        files = process_and_store_files(
            repo.data["repo_url"],
            pat_token=repo.data.get("pat_token")
        )
        
        # Process each file through RAG pipeline    
        for file in files:
            try:
                processDocument(file["content"])
            except Exception as e:
                print(f"Error processing document: {str(e)}")
                continue
            
        # Update repository status
        supabase.table("repositories").update({"status": "ready"}).eq("id", repo_id).execute()
        
    except Exception as e:
        supabase.table("repositories").update({
            "status": "error",
            "error_message": str(e)
        }).eq("id", repo_id).execute()

@app.get("/repositories/{repo_id}")
async def get_repository(repo_id: str):
    try:
        result = supabase.table("repositories").select("*").eq("id", repo_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Repository not found")
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add error handler for general exceptions
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": str(exc)},
    )
