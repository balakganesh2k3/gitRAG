# gitingest/cloning.py
from dulwich import porcelain
import os

def clone_repository(repo_url, clone_dir):
    if os.path.exists(clone_dir):
        print(f"Repository already exists at {clone_dir}")
    else:
        print(f"Cloning repository from {repo_url}...")
        porcelain.clone(repo_url, clone_dir)
    return clone_dir

# gitingest/ingestion.py
import os

def ingest_repository(repo_path):
    files_data = {}
    for root, _, files in os.walk(repo_path):
        for file in files:
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                files_data[file_path] = f.read()
    return files_data

# gitingest/query_parsing.py
def parse_query(user_query):
    """
    Parses the user's query into actionable components.
    """
    return {"keywords": user_query.lower().split()}
