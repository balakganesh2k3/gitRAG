# src/backend/router/index.py
from fastapi import APIRouter
from . import download, dynamic, github

router = APIRouter()
router.include_router(download.router)
router.include_router(dynamic.router)
router.include_router(github.router)
