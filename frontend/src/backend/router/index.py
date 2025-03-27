from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def index():
    """
    Returns a JSON response instead of rendering a Jinja template.
    """
    return {
        "message": "Welcome to the FastAPI server!",
        "title": "Home",
    }
