from fastapi import APIRouter, Depends, status
from app.auth import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/auth", tags=["User Authentication"])

@router.get(
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
