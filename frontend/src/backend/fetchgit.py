import requests
from supabase import create_client, Client
import base64
import os
from dotenv import load_dotenv
import openai
from typing import List, Dict, Optional

# Load environment variables
load_dotenv()

# GitHub API Configuration
GITHUB_API_URL = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# Supabase Configuration
SUPABASE_URL = "https://roivrfeinujkklcdjesd.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvaXZyZmVpbnVqa2tsY2RqZXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNjA5MTgsImV4cCI6MjA1NTYzNjkxOH0.VGI9pobo3RpIM-wcWbBGNeIUQND-F4eFA_IdKj_q4e0"

# Validate environment variables - removing Supabase check
if not GITHUB_TOKEN:
    raise EnvironmentError(
        "Missing GitHub token. Please ensure GITHUB_TOKEN is set in your .env file"
    )

# Initialize Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    raise Exception(f"Failed to initialize Supabase client: {str(e)}")

def get_repository_contents(owner: str, repo: str, path: str = "", token: Optional[str] = None) -> List[Dict]:
    """Recursively fetch all files from a GitHub repository"""
    headers = {
        "Authorization": f"token {token or GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/contents/{path}"
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"Failed to fetch repository contents: {response.json().get('message')}")
        
    contents = response.json()
    files = []
    
    if not isinstance(contents, list):
        contents = [contents]
        
    for item in contents:
        if item["type"] == "file":
            # Get file content
            if item["size"] <= 1000000:  # Skip files larger than 1MB
                file_response = requests.get(item["download_url"], headers=headers)
                if file_response.status_code == 200:
                    files.append({
                        "name": item["name"],
                        "path": item["path"],
                        "content": file_response.text
                    })
        elif item["type"] == "dir":
            # Recursively get directory contents
            files.extend(get_repository_contents(owner, repo, item["path"], token))
            
    return files

def process_and_store_files(repo_url: str, pat_token: Optional[str] = None) -> List[Dict]:
    """Process and store repository files"""
    try:
        # Extract owner and repo from URL
        parts = repo_url.strip("/").split("/")
        if len(parts) < 2:
            raise ValueError("Invalid GitHub repository URL")
            
        owner, repo = parts[-2], parts[-1]
        
        # Fetch all files from repository
        files = get_repository_contents(owner, repo, token=pat_token)
        
        processed_files = []
        for file in files:
            # Skip binary files and specific file types
            if not is_text_file(file["name"]):
                continue
                
            # Add file to processed list
            processed_files.append({
                "name": file["name"],
                "path": file["path"],
                "content": file["content"]
            })
            
            # Store in Supabase
            try:
                store_in_supabase(file["name"], file["content"])
            except Exception as e:
                print(f"Warning: Failed to store file {file['name']} in Supabase: {str(e)}")
            
        return processed_files
        
    except Exception as e:
        print(f"Error processing repository: {str(e)}")
        raise

def is_text_file(filename: str) -> bool:
    """Check if file is a text file based on extension"""
    text_extensions = {
        '.txt', '.md', '.py', '.js', '.jsx', '.ts', '.tsx', 
        '.html', '.css', '.json', '.yaml', '.yml', '.xml',
        '.csv', '.sql', '.sh', '.bash', '.env', '.config',
        '.java', '.cpp', '.c', '.h', '.hpp', '.rs', '.go',
        '.rb', '.php', '.pl', '.kt', '.swift', '.m', '.r'
    }
    return any(filename.lower().endswith(ext) for ext in text_extensions)

def generate_embedding(text):
    """ Generate an embedding for the given text """
    response = openai.Embedding.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response["data"][0]["embedding"]

def store_in_supabase(file_name: str, content: str) -> None:
    """Store file content in Supabase"""
    try:
        # Generate embedding for the content
        embedding = generate_embedding(content)
        
        data = {
            "file_name": file_name, 
            "content": content,
            "embedding": embedding
        }
        result = supabase.table("documents").insert(data).execute()
        if hasattr(result, 'error') and result.error:
            raise Exception(result.error)
    except Exception as e:
        raise Exception(f"Failed to store in Supabase: {str(e)}")

def get_file_content(file_path: str, owner: str, repo: str) -> Optional[str]:
    """Get file content from GitHub"""
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/contents/{file_path}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return base64.b64decode(response.json().get("content")).decode()
    return None

if __name__ == "__main__":
    # Test the configuration
    try:
        # Test Supabase connection
        supabase.table("documents").select("*").limit(1).execute()
        print("✅ Supabase connection successful")
        
        # Test GitHub token
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        response = requests.get(f"{GITHUB_API_URL}/user", headers=headers)
        if response.status_code == 200:
            print("✅ GitHub token valid")
        else:
            print("❌ GitHub token invalid")
            
    except Exception as e:
        print(f"❌ Configuration test failed: {str(e)}")
