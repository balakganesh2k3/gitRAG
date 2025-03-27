from typing import List
import openai
import os
from dotenv import load_dotenv

load_dotenv()

def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of text chunks."""
    openai.api_key = os.getenv('OPENAI_API_KEY')
    
    try:
        # Process in batches to avoid rate limits
        embeddings = []
        batch_size = 20
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            response = openai.embeddings.create(
                model="text-embedding-ada-002",
                input=batch
            )
            batch_embeddings = [item.embedding for item in response.data]
            embeddings.extend(batch_embeddings)
            
        return embeddings
        
    except Exception as e:
        raise Exception(f"Failed to generate embeddings: {str(e)}")
