from fastapi import APIRouter, HTTPException, status
from app.models.profile import ProfileInput, MatchResponse
from app.services.matcher import matcher_service

router = APIRouter(tags=["Eligibility Match Engine"])

@router.post(
    "/match",
    response_model=MatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Match user demographic profile to eligible government schemes"
)
@router.post(
    "/api/v1/match",
    response_model=MatchResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
async def match_schemes(profile: ProfileInput):
    """
    Accepts user demographic profile and returns top ranked eligible scheme matches.
    Acceptance Criteria (Ticket 3.3 & TDD Section 8.1).
    """
    try:
        match_response = matcher_service.match_profile(profile)
        return match_response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing scheme matching: {str(e)}"
        )
