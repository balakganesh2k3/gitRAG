from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, FLOAT
from .database import Base
from datetime import datetime
from pgvector.sqlalchemy import Vector

class Repository(Base):
    __tablename__ = "repositories"
    
    id = Column(String, primary_key=True)
    name = Column(String)
    owner = Column(String)
    repo_url = Column(String, unique=True)
    private = Column(Boolean, default=False)
    pat_token = Column(String, nullable=True)
    status = Column(String, default="pending")
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True)
    repository_id = Column(String, ForeignKey("repositories.id"))
    file_name = Column(String)
    content = Column(Text)
    embedding = Column(Vector(1536))  # For OpenAI embeddings
    created_at = Column(DateTime, default=datetime.utcnow) 