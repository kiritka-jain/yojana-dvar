from fastapi import APIRouter, HTTPException, status
from app.models.explain import ExplainRequest, ExplainResponse
from app.services.matcher import matcher_service
from app.services.gemini import gemini_service

router = APIRouter(tags=["AI Explanation Service"])

@router.post(
    "/explain",
    response_model=ExplainResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate plain-language eligibility explanation in Hindi or English using Gemini"
)
@router.post(
    "/api/v1/explain",
    response_model=ExplainResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
async def explain_scheme_eligibility(request: ExplainRequest):
    """
    Accepts scheme ID, applicant profile, and preferred language ('en' or 'hi').
    Returns personalized plain-language explanation, benefits, document checklist, and disclaimer.
    Acceptance Criteria (Ticket 4.2).
    """
    catalog = matcher_service.get_catalog()
    target_id = request.scheme_id.strip().lower()

    # Find scheme in catalog
    target_scheme = None
    for scheme in catalog:
        if str(scheme.get("scheme_id", "")).strip().lower() == target_id:
            target_scheme = scheme
            break

    if not target_scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID '{request.scheme_id}' not found."
        )

    try:
        explanation = gemini_service.generate_explanation(
            scheme=target_scheme,
            profile=request.profile,
            language=request.language
        )
        return explanation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate eligibility explanation: {str(e)}"
        )
