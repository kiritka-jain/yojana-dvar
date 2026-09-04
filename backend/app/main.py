import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers.health import router as health_router
from app.routers.match import router as match_router
from app.routers.schemes import router as schemes_router
from app.routers.personas import router as personas_router
from app.routers.explain import router as explain_router
from app.routers.user import auth_router, user_router

from app.services.gemini import gemini_service
from app.auth import init_firebase_admin

# Configure Structured Logging (Cloud Logging compatible)
logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s", "level":"%(levelname)s", "message":"%(message)s"}',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("yojana_dvar")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION} in {settings.ENVIRONMENT} mode.")
    init_firebase_admin()
    if gemini_service.is_available():
        logger.info(f"Gemini AI Service ready (Model: {gemini_service.get_model_name()}).")
    else:
        logger.info("Gemini AI Service running in fallback mode (GEMINI_API_KEY not configured).")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}.")

# Initialize FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Yojana Dvar REST API for Women Welfare Scheme Entitlement Discovery",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router)
app.include_router(match_router)
app.include_router(schemes_router)
app.include_router(personas_router)
app.include_router(explain_router)
app.include_router(auth_router)
app.include_router(auth_router, prefix="/api/v1", include_in_schema=False)
app.include_router(user_router)
app.include_router(user_router, prefix="/api/v1", include_in_schema=False)

@app.get("/", tags=["Root"])
async def root():
    """Root landing endpoint for the API service."""
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/health",
        "frontend_url": "http://localhost:5173"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
