from typing import List
import os
from dotenv import load_dotenv

load_dotenv()


CORS_ORIGINS: List[str] = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # Next.js default
    *os.getenv("ALLOWED_ORIGINS", "").split(",")  # Additional origins from env
]

# API Settings
API_V1_PREFIX = "/api/v1"
PROJECT_NAME = "GitRAG API"
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Supabase Settings
SUPABASE_URL = os.getenv("VITE_APP_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_APP_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in environment variables")

# Rate Limiting
RATE_LIMIT = os.getenv("RATE_LIMIT_DEFAULT", "100/hour")

# Additional configs
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
