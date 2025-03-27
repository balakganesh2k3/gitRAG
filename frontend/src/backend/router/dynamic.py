from fastapi import APIRouter, Form, Request
from ..server_utils import limiter

router = APIRouter()

@router.get("/{full_path:path}")
async def catch_all(request: Request, full_path: str):
    """
    Returns a JSON response instead of rendering a Jinja template.
    """
    return {
        "message": "Git repository info",
        "repo_url": full_path,
        "loading": True,
        "default_file_size": 243,
    }

@router.post("/{full_path:path}")
@limiter.limit("10/minute")
async def process_catch_all(
    request: Request,
    input_text: str = Form(...),
    max_file_size: int = Form(...),
    pattern_type: str = Form(...),
    pattern: str = Form(...),
):
    """
    Processes form submission and returns data as JSON instead of rendering a Jinja template.
    """
    return {
        "message": "Form submission processed",
        "repo_url": request.url.path,
        "input_text": input_text,
        "max_file_size": max_file_size,
        "pattern_type": pattern_type,
        "pattern": pattern,
    }
