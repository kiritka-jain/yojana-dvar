from app.routers.health import router as health_router
from app.routers.match import router as match_router
from app.routers.schemes import router as schemes_router
from app.routers.personas import router as personas_router
from app.routers.explain import router as explain_router
from app.routers.user import auth_router, user_router

__all__ = [
    "health_router",
    "match_router",
    "schemes_router",
    "personas_router",
    "explain_router",
    "auth_router",
    "user_router"
]
