from app.routers.health import router as health_router
from app.routers.match import router as match_router
from app.routers.schemes import router as schemes_router

__all__ = ["health_router", "match_router", "schemes_router"]
