from fastapi import APIRouter
from .download import router as download_router
from .dynamic import router as dynamic_router
from .index   import index as index_router

router = APIRouter()

# Include the routers
router.include_router(index_router, prefix="", tags=["index"])
router.include_router(download_router, prefix="/files", tags=["download"])
router.include_router(dynamic_router, prefix="/dynamic", tags=["dynamic"])
