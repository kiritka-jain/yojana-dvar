from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from app.services.matcher import matcher_service

router = APIRouter(tags=["Scheme Catalog"])

@router.get(
    "/schemes/search",
    response_model=Dict[str, Any],
    summary="Search scheme catalog by keyword, state, and category"
)
@router.get(
    "/api/v1/schemes/search",
    response_model=Dict[str, Any],
    include_in_schema=False
)
async def search_schemes(
    q: Optional[str] = Query(default="", description="Search query keyword"),
    state: Optional[str] = Query(default="", description="Filter by state name"),
    category: Optional[str] = Query(default="", description="Filter by scheme category"),
    limit: int = Query(default=10, ge=1, le=50, description="Max results to return")
):
    """
    Search scheme catalog across title, description, category, ministry, benefits, and state.
    """
    catalog = matcher_service.get_catalog()
    query_str = q.strip().lower() if q else ""
    state_str = state.strip().lower() if state else ""
    cat_str = category.strip().lower() if category else ""

    matched_results = []
    
    for scheme in catalog:
        # Check State Filter
        if state_str:
            scheme_state = str(scheme.get("state", "All")).strip().lower()
            eligible_states = str(scheme.get("eligible_states", "")).lower()
            if state_str not in scheme_state and state_str not in eligible_states and scheme_state != "all":
                continue
                
        # Check Category Filter
        if cat_str:
            scheme_cat = str(scheme.get("category", "")).strip().lower()
            if cat_str not in scheme_cat:
                continue

        # Check Keyword Search query
        if query_str:
            searchable_text = " ".join([
                str(scheme.get("name", "")),
                str(scheme.get("description", "")),
                str(scheme.get("ministry", "")),
                str(scheme.get("department", "")),
                str(scheme.get("category", "")),
                str(scheme.get("benefits", "")),
                str(scheme.get("eligibility_text", ""))
            ]).lower()
            
            if query_str not in searchable_text:
                continue

        matched_results.append(scheme)

    results_limited = matched_results[:limit]
    
    return {
        "count": len(results_limited),
        "total_matches": len(matched_results),
        "schemes": results_limited
    }

@router.get(
    "/schemes/{scheme_id}",
    response_model=Dict[str, Any],
    summary="Get complete scheme metadata by scheme ID slug"
)
@router.get(
    "/api/v1/schemes/{scheme_id}",
    response_model=Dict[str, Any],
    include_in_schema=False
)
async def get_scheme_by_id(scheme_id: str):
    """
    Retrieve full details for a specific scheme by ID slug.
    Raises HTTP 404 if scheme does not exist.
    """
    catalog = matcher_service.get_catalog()
    target_id = scheme_id.strip().lower()
    
    for scheme in catalog:
        sid = str(scheme.get("scheme_id", "")).strip().lower()
        if sid == target_id:
            return scheme

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Scheme with ID '{scheme_id}' not found."
    )
