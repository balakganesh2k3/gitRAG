from typing import List

def split_into_chunks(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        # Adjust end to avoid splitting words
        if end < text_length:
            end = text.rfind(' ', start, end) + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap
    
    return chunks

def estimate_tokens(text: str, tokens_per_word: float = 1.3) -> int:
    """Estimate number of tokens in text."""
    words = len(text.split())
    return int(words * tokens_per_word)
