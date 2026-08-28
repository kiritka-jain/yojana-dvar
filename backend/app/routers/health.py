import datetime
import time
from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])

START_TIME = time.time()

@router.get("/health", response_model=dict)
@router.get("/api/v1/health", response_model=dict)
async def health_check():
    """
    Health check endpoint returning system status, version, uptime, and timestamp.
    Acceptance Criteria (Ticket 3.1): Returns HTTP 200 { "status": "ok", "version": "1.0" }.
    """
    uptime = round(time.time() - START_TIME, 2)
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    return {
        "status": "ok",
        "version": settings.VERSION,
        "app_name": settings.APP_NAME,
        "uptime_seconds": uptime,
        "timestamp": now_iso
    }
