import pytest
from pydantic import ValidationError
from app.models.profile import ProfileInput, SchemeMatchResult, MatchResponse
from app.models.explain import ExplainRequest, ExplainResponse
from app.models.persona import Persona
from app.models.user_models import ProfileSaveRequest, BookmarkCreateRequest, BookmarkItem, BookmarksListResponse
from app.auth import AuthenticatedUser

# =============================================================================
# 1. ProfileInput Validation Tests
# =============================================================================

def test_profile_input_defaults():
    """Verify default field values for ProfileInput."""
    p = ProfileInput()
    assert p.state == "All"
    assert p.age == 25
    assert p.gender == "Female"
    assert p.caste == "General"
    assert p.income == 0
    assert p.residence == "All"
    assert p.life_stage == "general"
    assert p.is_bpl is False
    assert p.has_disability is False
    assert p.limit == 10

def test_profile_input_valid_bounds():
    """Verify ProfileInput accepts minimum and maximum valid values."""
    # Minimum valid bounds: age 0, income 0, limit 1
    p_min = ProfileInput(age=0, income=0, limit=1)
    assert p_min.age == 0
    assert p_min.income == 0
    assert p_min.limit == 1

    # Maximum valid bounds: age 120, income high, limit 50
    p_max = ProfileInput(age=120, income=100000000, limit=50)
    assert p_max.age == 120
    assert p_max.income == 100000000
    assert p_max.limit == 50

def test_profile_input_negative_age_fails():
    """Verify age < 0 raises ValidationError."""
    with pytest.raises(ValidationError):
        ProfileInput(age=-1)

def test_profile_input_excessive_age_fails():
    """Verify age > 120 raises ValidationError."""
    with pytest.raises(ValidationError):
        ProfileInput(age=121)

def test_profile_input_negative_income_fails():
    """Verify income < 0 raises ValidationError."""
    with pytest.raises(ValidationError):
        ProfileInput(income=-100)

def test_profile_input_limit_bounds_fail():
    """Verify limit < 1 and limit > 50 raise ValidationError."""
    with pytest.raises(ValidationError):
        ProfileInput(limit=0)

    with pytest.raises(ValidationError):
        ProfileInput(limit=51)

def test_profile_input_invalid_types_fail():
    """Verify non-convertible types raise ValidationError."""
    with pytest.raises(ValidationError):
        ProfileInput(age="not-a-number")  # type: ignore

    with pytest.raises(ValidationError):
        ProfileInput(is_bpl="not-a-bool")  # type: ignore

# =============================================================================
# 2. SchemeMatchResult and MatchResponse Schema Tests
# =============================================================================

def test_scheme_match_result_schema():
    """Verify SchemeMatchResult serialization and required fields."""
    item = SchemeMatchResult(
        scheme_id="pmmvy-central",
        name="Pradhan Mantri Matru Vandana Yojana",
        description="Maternity benefit scheme",
        ministry="Ministry of Women and Child Development",
        department="WCD",
        state="All",
        category="Maternal Health",
        beneficiary_type="Pregnant Women and Lactating Mothers",
        benefits="Cash incentive of Rs 5000",
        eligibility_text="First living child",
        documents_required="Aadhaar, MCP Card",
        application_process="Online / Anganwadi",
        apply_url="https://pmmvy.wcd.gov.in",
        official_url="https://wcd.nic.in",
        age_min=19,
        age_max=45,
        gender="Female",
        caste_categories='["All"]',
        income_max=250000,
        residence="All",
        eligible_states='["All"]',
        requires_bpl=False,
        requires_disability=False,
        life_stage_tags='["maternal"]',
        is_active=True,
        match_score=95,
        match_reasons=["Age matches", "Life stage matches"]
    )
    assert item.scheme_id == "pmmvy-central"
    assert item.match_score == 95
    assert len(item.match_reasons) == 2

    # Required field missing should raise ValidationError
    with pytest.raises(ValidationError):
        SchemeMatchResult(scheme_id="incomplete-scheme")  # type: ignore

def test_match_response_schema():
    """Verify MatchResponse envelope structure."""
    res = MatchResponse(
        match_id="test-uuid-1234",
        count=0,
        schemes=[],
        execution_time_ms=12.5
    )
    assert res.match_id == "test-uuid-1234"
    assert res.count == 0
    assert res.schemes == []
    assert res.execution_time_ms == 12.5

# =============================================================================
# 3. Explain Request / Response Schemas
# =============================================================================

def test_explain_schemas():
    """Verify ExplainRequest and ExplainResponse schemas."""
    req = ExplainRequest(
        scheme_id="pmmvy-central",
        profile=ProfileInput(age=26, gender="Female"),
        language="hi"
    )
    assert req.scheme_id == "pmmvy-central"
    assert req.language == "hi"
    assert req.profile.age == 26

    # Default language is "en"
    req_default_lang = ExplainRequest(
        scheme_id="pmmvy-central",
        profile=ProfileInput()
    )
    assert req_default_lang.language == "en"

    # ExplainResponse validation
    resp = ExplainResponse(
        scheme_id="pmmvy-central",
        language="en",
        summary="You qualify because you are an expecting mother.",
        key_benefits=["Cash incentive Rs 5000"],
        documents_required=["Aadhaar Card"],
        next_steps="Visit Anganwadi",
        disclaimer="Advisory only",
        is_fallback=False
    )
    assert resp.is_fallback is False
    assert len(resp.key_benefits) == 1
    assert len(resp.documents_required) == 1

# =============================================================================
# 4. Persona Schema
# =============================================================================

def test_persona_schema():
    """Verify Persona schema and nested ProfileInput."""
    p = Persona(
        id="sunita",
        name="Sunita Devi",
        title="Pregnant Mother in Bihar",
        subtitle="SC Category • BPL",
        avatar="https://example.com/avatar.svg",
        description="26 year old mother",
        profile=ProfileInput(state="Bihar", age=26, is_bpl=True, life_stage="maternal")
    )
    assert p.id == "sunita"
    assert p.profile.state == "Bihar"
    assert p.profile.is_bpl is True

# =============================================================================
# 5. User & Bookmark Models
# =============================================================================

def test_user_models():
    """Verify BookmarkItem, ProfileSaveRequest, and AuthenticatedUser schemas."""
    bm = BookmarkItem(
        scheme_id="pmmvy-central",
        uid="user-123",
        created_at="2026-09-02T12:00:00Z",
        metadata={"name": "PMMVY", "category": "Maternal"}
    )
    assert bm.scheme_id == "pmmvy-central"
    assert bm.uid == "user-123"
    assert bm.metadata["name"] == "PMMVY"

    user = AuthenticatedUser(
        uid="user-test-789",
        email="user@test.com",
        is_anonymous=False,
        auth_provider="google"
    )
    assert user.uid == "user-test-789"
    assert user.auth_provider == "google"

    save_req = ProfileSaveRequest(
        profile=ProfileInput(state="Delhi", age=30),
        profile_id="default"
    )
    assert save_req.profile.state == "Delhi"
    assert save_req.profile_id == "default"
