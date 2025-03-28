# src/backend/router/github.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
import tempfile
import subprocess
from ..utils.embeddings import process_embeddings
from ..lib.rag.processing import process_repository_content

router = APIRouter(prefix="/api/github", tags=["github"])

class RepositoryRequest(BaseModel):
    owner: str
    repo: str
    branch: Optional[str] = "main"
    file_paths: Optional[List[str]] = None

@router.post("/process")
async def process_github_repo(request: RepositoryRequest):
    try:
        # Clone repository to temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_url = f"https://github.com/{request.owner}/{request.repo}.git"
            subprocess.run(["git", "clone", "--depth", "1", "--branch", request.branch, repo_url, temp_dir], check=True)
            
            # Process repository content
            files_to_process = request.file_paths if request.file_paths else None
            processed_data = process_repository_content(temp_dir, files_to_process)
            
            # Generate embeddings
            embedding_results = process_embeddings(processed_data)
            
            # Store in database with repository metadata
            # ...
            
            return {"status": "success", "processed_files": len(processed_data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process repository: {str(e)}")
