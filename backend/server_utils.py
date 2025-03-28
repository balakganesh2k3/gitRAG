from fastapi import FastAPI
from contextlib import asynccontextmanager
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown."""
    print("Starting application...")
    yield
    print("Shutting down application...")

def rate_limit_exception_handler(request, exc: RateLimitExceeded):
    """Custom handler for rate-limited requests."""
    return JSONResponse(
        status_code=429,
        content={"error": "Too many requests, please try again later."},
    )
