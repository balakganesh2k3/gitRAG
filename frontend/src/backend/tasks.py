from backend.celery_app import celery_app
from supabase import create_client
import os
from dotenv import load_dotenv
from backend.lib.rag.processing import processDocument
load_dotenv()

SUPABASE_URL = os.getenv("VITE_APP_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_APP_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("VITE_APP_SUPABASE_URL and VITE_APP_SUPABASE_ANON_KEY must be set in .env file")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@celery_app.task(name="index_repo")
def index_repo(repo_id: str):
    """
    Background task to index repository content
    """
    try:
        # Add indexing logic here
        print(f"Indexing repository {repo_id}")
        return {"status": "completed", "repo_id": repo_id}
    except Exception as e:
        print(f"Error indexing repository {repo_id}: {str(e)}")
        raise
