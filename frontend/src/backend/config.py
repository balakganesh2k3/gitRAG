import os
from dotenv import load_dotenv
from typing import List

# Load environment variables
load_dotenv()

# CORS settings
CORS_ORIGINS: List[str] = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # Next.js default
    "http://localhost:8000",  # FastAPI default
    *os.getenv("ALLOWED_ORIGINS", "").split(",")  # Additional origins from env
]

# Security settings
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
CORS_ALLOW_HEADERS = [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
]
CORS_EXPOSE_HEADERS = ["Content-Length", "Content-Range"]
CORS_ALLOW_CREDENTIALS = True
CORS_MAX_AGE = 600  # 10 minutes

# API Settings
API_V1_PREFIX = "/api/v1"
PROJECT_NAME = "GitRAG API"
RATE_LIMIT = 100
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Database and Service Configurations
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables")

SUPABASE_URL="https://roivrfeinujkklcdjesd.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvaXZyZmVpbnVqa2tsY2RqZXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNjA5MTgsImV4cCI6MjA1NTYzNjkxOH0.VGI9pobo3RpIM-wcWbBGNeIUQND-F4eFA_IdKj_q4e0"