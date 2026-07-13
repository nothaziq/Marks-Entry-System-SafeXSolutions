"""
Application entry point: creates the FastAPI app, wires up CORS,
exception handlers, and the versioned API router.

Run locally with:  uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router
from app.middleware.error_handler import register_exception_handlers

app = FastAPI(
    title=settings.APP_NAME,
    description="Attendance Module (Teacher Side) - Marks Entry System, Group 22",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(api_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"success": True, "message": "Attendance Module API is running.", "data": None}
