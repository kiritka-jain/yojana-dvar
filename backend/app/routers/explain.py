from fastapi import APIRouter, HTTPException, status
from app.models.explain import ExplainRequest, ExplainResponse, PortfolioExplainRequest, PortfolioExplainResponse
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
        explanation = await gemini_service.generate_explanation_async(
            scheme=target_scheme,
            profile=request.profile,
            language=request.language
        )
        return explanation
    except Exception as e:
        # Guarantee HTTP 200 with static fallback to protect UX (Ticket 4.3)
        return gemini_service._generate_fallback_explanation(
            scheme=target_scheme,
            profile=request.profile,
            lang=request.language
        )

@router.post(
    "/explain/portfolio",
    response_model=PortfolioExplainResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate multi-scheme holistic welfare empowerment summary using Gemini (Ticket 4.3)"
)
@router.post(
    "/api/v1/explain/portfolio",
    response_model=PortfolioExplainResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
async def explain_portfolio_summary(request: PortfolioExplainRequest):
    """
    Accepts applicant profile and optional scheme IDs, reranks to Top-K schemes, and returns
    a holistic empowerment summary and prioritized action plan in Hindi or English (Ticket 4.3).
    """
    catalog = matcher_service.get_catalog()

    if request.scheme_ids:
        target_ids = {sid.strip().lower() for sid in request.scheme_ids}
        matched_schemes = [s for s in catalog if str(s.get("scheme_id", "")).strip().lower() in target_ids]
    else:
        # Automatically run match engine to find eligible schemes
        match_res = matcher_service.match_profile(request.profile)
        matched_schemes = [s.model_dump() for s in match_res.schemes]

    try:
        summary_resp = await gemini_service.generate_portfolio_summary_async(
            matched_schemes=matched_schemes,
            profile=request.profile,
            language=request.language,
            top_k=request.top_k
        )
        return summary_resp
    except Exception:
        top_schemes = gemini_service.select_top_k_schemes(matched_schemes, request.profile, k=request.top_k)
        return gemini_service._generate_fallback_portfolio_summary(
            top_schemes=top_schemes,
            profile=request.profile,
            lang=request.language
        )
