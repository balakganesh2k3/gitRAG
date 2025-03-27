from typing import Dict, Optional, List
import logging
from .utils.text_processing import split_into_chunks, estimate_tokens
from .utils.embeddings import generate_embeddings

def processDocument(content: str, max_file_size: int = 50 * 1024) -> Dict:
    """
    Process a document through the RAG pipeline.
    
    Args:
        content (str): The content of the document to process
        max_file_size (int): Maximum file size in bytes (default: 50KB)
        
    Returns:
        Dict: Processed document data including chunks and embeddings
    """
    try:
        # Truncate content if it exceeds max file size
        if len(content.encode('utf-8')) > max_file_size:
            content = content[:max_file_size].encode('utf-8').decode('utf-8', 'ignore')
            logging.warning(f"Content truncated to {max_file_size} bytes")

        # Split content into chunks
        chunks = split_into_chunks(content)
        
        # Generate embeddings for chunks
        embeddings = generate_embeddings(chunks)
        
        # Estimate tokens for logging
        estimated_tokens = estimate_tokens(content)
        
        return {
            "chunks": chunks,
            "embeddings": embeddings,
            "metadata": {
                "total_chunks": len(chunks),
                "estimated_tokens": estimated_tokens,
                "original_size": len(content.encode('utf-8')),
                "processed_size": sum(len(chunk.encode('utf-8')) for chunk in chunks)
            }
        }

    except Exception as e:
        logging.error(f"Error processing document: {str(e)}")
        raise
