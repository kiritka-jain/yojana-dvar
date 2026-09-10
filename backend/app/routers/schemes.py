from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from app.services.matcher import matcher_service
from app.services.translations import get_localized_scheme_field, store_dynamic_translation

router = APIRouter(tags=["Scheme Catalog"])

@router.get(
    "/schemes",
    response_model=Dict[str, Any],
    summary="Get all schemes from the expanded catalog with optional filtering"
)
@router.get(
    "/api/v1/schemes",
    response_model=Dict[str, Any],
    include_in_schema=False
)
async def get_all_schemes(
    state: Optional[str] = Query(default=None, description="Filter by state name"),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    life_stage: Optional[str] = Query(default=None, description="Filter by life stage tag"),
    limit: Optional[int] = Query(default=None, ge=1, description="Max schemes to return"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination")
):
    """
    Retrieve all schemes in the catalog. Supports optional filtering by state, category, and life stage.
    """
    catalog = matcher_service.get_catalog()
    state_str = state.strip().lower() if state else ""
    cat_str = category.strip().lower() if category else ""
    life_stage_str = life_stage.strip().lower() if life_stage else ""

    filtered = []
    for scheme in catalog:
        if state_str:
            scheme_state = str(scheme.get("state", "All")).strip().lower()
            eligible_states = str(scheme.get("eligible_states", "")).lower()
            if state_str not in scheme_state and state_str not in eligible_states and scheme_state != "all":
                continue

        if cat_str:
            scheme_cat = str(scheme.get("category", "")).strip().lower()
            if cat_str not in scheme_cat:
                continue

        if life_stage_str:
            tags = str(scheme.get("life_stage_tags", "")).lower()
            if life_stage_str not in tags:
                continue

        filtered.append(scheme)

    total = len(filtered)
    if limit is not None:
        paginated = filtered[offset:offset + limit]
    else:
        paginated = filtered[offset:]

    return {
        "count": len(paginated),
        "total": total,
        "offset": offset,
        "schemes": paginated
    }

@router.get(
    "/schemes/search",
    response_model=Dict[str, Any],
    summary="Search scheme catalog by keyword, state, category, and demographics"
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
    age: Optional[int] = Query(default=None, ge=0, le=110, description="Optional age demographic filter"),
    life_stage: Optional[str] = Query(default=None, description="Optional life stage filter"),
    gender: Optional[str] = Query(default=None, description="Optional gender filter"),
    limit: int = Query(default=10, ge=1, le=100, description="Max results to return")
):
    """
    Search scheme catalog across title, description, category, ministry, benefits, state, and demographic bounds.
    """
    catalog = matcher_service.get_catalog()
    query_str = q.strip().lower() if q else ""
    state_str = state.strip().lower() if state else ""
    cat_str = category.strip().lower() if category else ""
    life_stage_str = life_stage.strip().lower() if life_stage else ""
    gender_str = gender.strip().lower() if gender else ""

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

        # Check Age Demographic Filter (TICKET-401)
        if age is not None:
            age_min = int(scheme.get("age_min", 0))
            age_max = int(scheme.get("age_max", 100))
            if not (age_min <= age <= age_max):
                continue

        # Check Life Stage Filter
        if life_stage_str:
            tags = str(scheme.get("life_stage_tags", "")).lower()
            if life_stage_str not in tags:
                continue

        # Check Gender Filter
        if gender_str:
            scheme_gender = str(scheme.get("gender", "Female")).strip().lower()
            if scheme_gender not in ["all", "all india"] and scheme_gender != gender_str:
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
    Retrieve full details for a specific scheme by ID slug or alias.
    Raises HTTP 404 if scheme does not exist.
    """
    scheme = matcher_service.get_scheme_by_id(scheme_id)
    if scheme:
        return scheme

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Scheme with ID '{scheme_id}' not found."
    )

@router.post(
    "/schemes/{scheme_id}/translate",
    response_model=Dict[str, Any],
    summary="Get localized / translated scheme content on-demand"
)
@router.post(
    "/api/v1/schemes/{scheme_id}/translate",
    response_model=Dict[str, Any],
    include_in_schema=False
)
async def translate_scheme(
    scheme_id: str,
    lang: str = Query(default="hi", description="Target language code: 'hi' for Hindi, 'en' for English")
):
    """
    Returns localized scheme fields (name_hi, ministry_hi, application_process_hi, etc.).
    Supports cached lookup and on-demand fallback. (Epic 1: YD-I18N-103)
    """
    scheme = matcher_service.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID '{scheme_id}' not found."
        )

    clean_lang = lang.strip().lower()
    if clean_lang != "hi":
        return {
            "scheme_id": scheme.get("scheme_id"),
            "language": "en",
            "name": scheme.get("name"),
            "ministry": scheme.get("ministry"),
            "category": scheme.get("category"),
            "benefits": scheme.get("benefits"),
            "description": scheme.get("description"),
            "application_process": scheme.get("application_process"),
            "documents_required": scheme.get("documents_required"),
            "eligibility_text": scheme.get("eligibility_text"),
            "is_cached": True
        }

    # Extract or resolve Hindi fields
    name_hi = get_localized_scheme_field(scheme, "name", "hi")
    ministry_hi = get_localized_scheme_field(scheme, "ministry", "hi")
    category_hi = get_localized_scheme_field(scheme, "category", "hi")
    benefits_hi = get_localized_scheme_field(scheme, "benefits", "hi")
    description_hi = get_localized_scheme_field(scheme, "description", "hi")
    application_process_hi = get_localized_scheme_field(scheme, "application_process", "hi")
    documents_required_hi = get_localized_scheme_field(scheme, "documents_required", "hi")
    eligibility_text_hi = get_localized_scheme_field(scheme, "eligibility_text", "hi")

    result = {
        "scheme_id": scheme.get("scheme_id"),
        "language": "hi",
        "name_hi": name_hi,
        "ministry_hi": ministry_hi,
        "category_hi": category_hi,
        "benefits_hi": benefits_hi,
        "description_hi": description_hi,
        "application_process_hi": application_process_hi,
        "documents_required_hi": documents_required_hi,
        "eligibility_text_hi": eligibility_text_hi,
        "is_cached": True
    }

    # Store in memory translation cache
    store_dynamic_translation(scheme_id, {
        "name_hi": name_hi,
        "ministry_hi": ministry_hi,
        "category_hi": category_hi,
        "benefits_hi": benefits_hi,
        "description_hi": description_hi,
        "application_process_hi": application_process_hi,
        "documents_required_hi": documents_required_hi,
        "eligibility_text_hi": eligibility_text_hi
    })

    return result

