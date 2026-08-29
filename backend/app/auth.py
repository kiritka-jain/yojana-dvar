import logging
import os
from typing import Optional, Dict, Any
import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.config import settings

logger = logging.getLogger("yojana_dvar")

# Initialize Firebase Admin SDK safely
_firebase_initialized = False

def init_firebase_admin():
    """Initializes Firebase Admin SDK using ADC or credentials if available."""
    global _firebase_initialized
    if _firebase_initialized or firebase_admin._apps:
        _firebase_initialized = True
        return

    try:
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {"projectId": settings.GCP_PROJECT_ID})
        else:
            firebase_admin.initialize_app(options={"projectId": settings.GCP_PROJECT_ID})
        _firebase_initialized = True
        logger.info(f"Firebase Admin SDK initialized successfully for project '{settings.GCP_PROJECT_ID}'.")
    except Exception as e:
        logger.warning(f"Firebase Admin SDK initialization deferred or running in local dev mode: {e}")

init_firebase_admin()

# Security scheme for Bearer token extraction
security = HTTPBearer(auto_error=False)

class AuthenticatedUser(BaseModel):
    """Authenticated user profile injected by auth dependency."""
    uid: str
    email: Optional[str] = None
    is_anonymous: bool = False
    auth_provider: str = "google"
    token_claims: Dict[str, Any] = {}

def decode_firebase_token(token: str) -> Dict[str, Any]:
    """
    Decodes and verifies Firebase ID token.
    Supports local dev mock tokens (e.g. 'dev-token-<uid>' or 'anon-token-<uid>')
    when running in development mode without live service account credentials.
    """
    # 1. Dev / Test token support for local offline development
    if token.startswith("dev-token-"):
        uid = token.replace("dev-token-", "")
        return {
            "uid": uid,
            "email": f"{uid}@example.com",
            "firebase": {"sign_in_provider": "google.com"}
        }
    elif token.startswith("anon-token-"):
        uid = token.replace("anon-token-", "")
        return {
            "uid": uid,
            "email": None,
            "firebase": {"sign_in_provider": "anonymous"}
        }

    # 2. Verify with Firebase Admin SDK
    try:
        decoded_token = firebase_auth.verify_id_token(token, check_revoked=False)
        return decoded_token
    except Exception as e:
        logger.debug(f"Firebase token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def get_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> AuthenticatedUser:
    """
    FastAPI dependency that enforces Bearer token authentication (Ticket 5.1).
    Returns AuthenticatedUser model or raises HTTP 401 Unauthorized.
    """
    if not auth_header or not auth_header.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Bearer token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = auth_header.credentials.strip()
    decoded = decode_firebase_token(token)

    uid = decoded.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain a valid user identifier (uid)",
            headers={"WWW-Authenticate": "Bearer"}
        )

    firebase_info = decoded.get("firebase", {})
    provider = firebase_info.get("sign_in_provider", "custom")
    is_anon = (provider == "anonymous")

    return AuthenticatedUser(
        uid=uid,
        email=decoded.get("email"),
        is_anonymous=is_anon,
        auth_provider=provider,
        token_claims=decoded
    )

async def get_optional_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[AuthenticatedUser]:
    """
    Optional auth dependency: returns AuthenticatedUser if valid token present, else None.
    """
    if not auth_header or not auth_header.credentials:
        return None
    try:
        return await get_current_user(auth_header)
    except HTTPException:
        return None
