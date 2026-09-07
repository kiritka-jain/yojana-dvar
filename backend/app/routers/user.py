from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user, AuthenticatedUser
from app.models.profile import ProfileInput
from app.models.user_models import (
    ProfileSaveRequest,
    BookmarkCreateRequest,
    BookmarkItem,
    BookmarksListResponse
)
from app.services.firestore import firestore_service
from app.services.matcher import matcher_service

auth_router = APIRouter(prefix="/auth", tags=["User Authentication"])
user_router = APIRouter(prefix="/user", tags=["User Profile & Bookmarks"])

# -----------------------------------------------------------------------------
# Auth Endpoints (Ticket 5.1)
# -----------------------------------------------------------------------------

@auth_router.get(
    "/me",
    response_model=AuthenticatedUser,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated user identity and token claims"
)
async def get_me(user: AuthenticatedUser = Depends(get_current_user)):
    """
    Protected endpoint verifying caller identity from Firebase ID token.
    Acceptance Criteria (Ticket 5.1).
    """
    return user

# -----------------------------------------------------------------------------
# User Profile Endpoints (Ticket 5.3)
# -----------------------------------------------------------------------------

@user_router.post(
    "/profile",
    status_code=status.HTTP_200_OK,
    summary="Save user demographic profile"
)
async def save_user_profile(
    request: ProfileSaveRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Persists user demographic profile to Firestore under `users/{uid}/profiles/{profileId}`.
    Acceptance Criteria (Ticket 5.3).
    """
    profile_dict = request.profile.model_dump()
    saved = firestore_service.save_profile(
        uid=user.uid,
        profile_id=request.profile_id,
        profile_data=profile_dict
    )
    return {"status": "success", "profile": saved}

@user_router.get(
    "/profile",
    status_code=status.HTTP_200_OK,
    summary="Retrieve saved user demographic profile"
)
async def get_user_profile(
    profile_id: str = "default",
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Retrieves saved demographic profile from Firestore.
    Raises 404 if no profile is saved.
    Acceptance Criteria (Ticket 5.3).
    """
    profile = firestore_service.get_profile(uid=user.uid, profile_id=profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile '{profile_id}' not found for authenticated user."
        )
    return {"status": "success", "profile": profile}

# -----------------------------------------------------------------------------
# User Bookmarks Endpoints (Ticket 5.3)
# -----------------------------------------------------------------------------

@user_router.post(
    "/bookmarks",
    status_code=status.HTTP_200_OK,
    summary="Bookmark a government welfare scheme"
)
async def add_user_bookmark(
    request: BookmarkCreateRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Saves a scheme bookmark in Firestore under `users/{uid}/bookmarks/{schemeId}`.
    Acceptance Criteria (Ticket 5.3).
    """
    # Lookup scheme metadata from catalog
    s = matcher_service.get_scheme_by_id(request.scheme_id)
    scheme_meta = None
    if s:
        scheme_meta = {
            "name": s.get("name"),
            "category": s.get("category"),
            "ministry": s.get("ministry")
        }

    saved_bookmark = firestore_service.add_bookmark(
        uid=user.uid,
        scheme_id=request.scheme_id,
        metadata=scheme_meta
    )
    return {"status": "success", "bookmark": saved_bookmark}

@user_router.get(
    "/bookmarks",
    response_model=BookmarksListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all saved bookmarks enriched with scheme metadata"
)
async def list_user_bookmarks(
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Lists all saved bookmarks for authenticated user enriched with catalog details.
    Acceptance Criteria (Ticket 5.3).
    """
    raw_bookmarks = firestore_service.list_bookmarks(uid=user.uid)

    enriched_bookmarks: List[BookmarkItem] = []
    for b in raw_bookmarks:
        sid = str(b.get("scheme_id", "")).strip()
        matched_scheme = matcher_service.get_scheme_by_id(sid)
        enriched_bookmarks.append(
            BookmarkItem(
                scheme_id=b.get("scheme_id", ""),
                uid=b.get("uid", user.uid),
                created_at=b.get("created_at", ""),
                metadata=b.get("metadata"),
                scheme=matched_scheme
            )
        )

    return BookmarksListResponse(
        count=len(enriched_bookmarks),
        bookmarks=enriched_bookmarks
    )

@user_router.delete(
    "/bookmarks/{scheme_id}",
    status_code=status.HTTP_200_OK,
    summary="Remove a saved scheme bookmark"
)
async def delete_user_bookmark(
    scheme_id: str,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Deletes a scheme bookmark from Firestore under `users/{uid}/bookmarks/{schemeId}`.
    Acceptance Criteria (Ticket 5.3).
    """
    deleted = firestore_service.delete_bookmark(uid=user.uid, scheme_id=scheme_id)
    return {
        "status": "deleted" if deleted else "not_found",
        "scheme_id": scheme_id
    }
