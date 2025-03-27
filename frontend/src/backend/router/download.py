from fastapi import APIRouter, Response, HTTPException
from pathlib import Path

router = APIRouter()

TMP_BASE_PATH = Path("/tmp")  # Update this path based on your actual directory structure

@router.get("/download/{digest_id}")
async def download_ingest(digest_id: str) -> Response:
    """
    Download a .txt file associated with a given digest ID.
    """
    directory = TMP_BASE_PATH / digest_id

    try:
        if not directory.exists():
            raise FileNotFoundError("Directory not found")

        txt_files = [f for f in directory.iterdir() if f.suffix == ".txt"]
        if not txt_files:
            raise FileNotFoundError("No .txt file found")

    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Digest not found") from exc

    first_file = txt_files[0]

    with first_file.open(encoding="utf-8") as f:
        content = f.read()

    return Response(
        content=content,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={first_file.name}"},
    )
