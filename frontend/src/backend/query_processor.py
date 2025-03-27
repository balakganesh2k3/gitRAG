# gitingest/query_processing.py
from .modules import clone_repository
from .modules import ingest_repository
from .modules import parse_query

def process_query(repo_url, clone_dir, user_query):
    """
    Clones a repository, ingests its contents, and searches for keywords from the user query.
    """
    # Clone the repository
    repo_path = clone_repository(repo_url, clone_dir)

    # Ingest repository contents
    repo_data = ingest_repository(repo_path)

    # Parse the query
    query_keywords = parse_query(user_query)["keywords"]

    # Search for relevant content
    results = {}
    for file_path, content in repo_data.items():
        if any(keyword in content.lower() for keyword in query_keywords):
            results[file_path] = content[:500]  # Return first 500 chars for preview

    return results
