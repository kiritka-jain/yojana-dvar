import pytest
from app.models.profile import ProfileInput
from app.services.matcher import EligibilityMatcher

@pytest.fixture
def matcher():
    return EligibilityMatcher()

# =============================================================================
# 1. Real Catalog Integration Boundary Tests
# =============================================================================

def test_age_boundary_matching(matcher):
    """Test age boundary limits on real catalog (e.g. Sukanya Samriddhi Yojana max age 10)."""
    # 5 year old girl should qualify for SSY
    profile_child = ProfileInput(age=5, gender="Female", state="All", life_stage="student")
    res_child = matcher.match_profile(profile_child)
    ssy_matches = [s for s in res_child.schemes if s.scheme_id in ["sukanya-samriddhi-yojana", "ssy-central"]]
    assert len(ssy_matches) == 1
    
    # 15 year old girl should NOT qualify for SSY (age max is 10)
    profile_teen = ProfileInput(age=15, gender="Female", state="All", life_stage="student")
    res_teen = matcher.match_profile(profile_teen)
    ssy_matches_teen = [s for s in res_teen.schemes if s.scheme_id in ["sukanya-samriddhi-yojana", "ssy-central"]]
    assert len(ssy_matches_teen) == 0

def test_income_max_boundary(matcher):
    """Test annual family income cap filtering on real catalog."""
    # Low Income woman (Rs 50,000) qualifies for PMMVY (max 2,50,000)
    profile_low_income = ProfileInput(age=25, gender="Female", state="All", income=50000, is_bpl=True, life_stage="maternal")
    res_low = matcher.match_profile(profile_low_income)
    pmmvy_matches = [s for s in res_low.schemes if s.scheme_id in ["pradhan-mantri-matru-vandana-yojana", "pmmvy-central"]]
    assert len(pmmvy_matches) == 1

    # High Income woman (Rs 10,00,000) should NOT qualify for income-capped PMMVY
    profile_high_income = ProfileInput(age=25, gender="Female", state="All", income=1000000, is_bpl=False, life_stage="maternal")
    res_high = matcher.match_profile(profile_high_income)
    pmmvy_high_matches = [s for s in res_high.schemes if s.scheme_id in ["pradhan-mantri-matru-vandana-yojana", "pmmvy-central"]]
    assert len(pmmvy_high_matches) == 0

def test_state_specific_filtering(matcher):
    """Test state targeted scheme filtering on real catalog (UP vs TN)."""
    # UP resident should qualify for Mukhya Mantri Kanya Sumangala Yojana (Uttar Pradesh)
    profile_up = ProfileInput(age=12, gender="Female", state="Uttar Pradesh", life_stage="student")
    res_up = matcher.match_profile(profile_up)
    up_matches = [s for s in res_up.schemes if s.scheme_id in ["mukhya-mantri-kanya-sumangala-yojana", "kanya-sumangala-up"]]
    assert len(up_matches) == 1

    # Tamil Nadu resident should NOT qualify for UP state scheme
    profile_tn = ProfileInput(age=12, gender="Female", state="Tamil Nadu", life_stage="student")
    res_tn = matcher.match_profile(profile_tn)
    up_in_tn = [s for s in res_tn.schemes if s.scheme_id in ["mukhya-mantri-kanya-sumangala-yojana", "kanya-sumangala-up"]]
    assert len(up_in_tn) == 0

def test_life_stage_score_boost(matcher):
    """Test that matching life_stage receives ranking score boost (+30)."""
    profile_maternal = ProfileInput(age=26, gender="Female", state="Bihar", is_bpl=True, life_stage="maternal")
    res = matcher.match_profile(profile_maternal)
    
    pmmvy = next(s for s in res.schemes if s.scheme_id in ["pradhan-mantri-matru-vandana-yojana", "pmmvy-central"])
    assert pmmvy.match_score >= 80
    assert any("life stage" in reason.lower() for reason in pmmvy.match_reasons)

def test_limit_parameter_truncation(matcher):
    """Test that result count strictly honors profile.limit parameter."""
    profile_limit_3 = ProfileInput(age=25, gender="Female", state="All", limit=3)
    res_3 = matcher.match_profile(profile_limit_3)
    assert len(res_3.schemes) <= 3
    assert res_3.count == len(res_3.schemes)

    profile_limit_1 = ProfileInput(age=25, gender="Female", state="All", limit=1)
    res_1 = matcher.match_profile(profile_limit_1)
    assert len(res_1.schemes) <= 1

# =============================================================================
# 2. Controlled Boundary Unit Tests for evaluate_scheme
# =============================================================================

@pytest.fixture
def base_scheme():
    """Returns a baseline synthetic scheme passing all standard defaults."""
    return {
        "scheme_id": "test-scheme",
        "name": "Test Welfare Scheme",
        "is_active": True,
        "gender": "Female",
        "age_min": 18,
        "age_max": 40,
        "state": "All",
        "eligible_states": '["All"]',
        "caste_categories": '["All"]',
        "income_max": 300000,
        "residence": "All",
        "requires_bpl": False,
        "requires_disability": False,
        "life_stage_tags": '["general"]'
    }

def test_rule_active_flag(matcher, base_scheme):
    """Schemes marked is_active=False must never qualify."""
    profile = ProfileInput(age=25, gender="Female", state="Delhi")
    
    base_scheme["is_active"] = True
    eligible, _, _ = matcher.evaluate_scheme(profile, base_scheme)
    assert eligible is True

    base_scheme["is_active"] = False
    eligible, score, reasons = matcher.evaluate_scheme(profile, base_scheme)
    assert eligible is False
    assert score == 0
    assert len(reasons) == 0

def test_rule_age_boundary_conditions(matcher, base_scheme):
    """
    Verify exact age boundary edge cases:
    - age == age_min (inclusive, passes)
    - age == age_min - 1 (exclusive, rejected)
    - age == age_max (inclusive, passes)
    - age == age_max + 1 (exclusive, rejected)
    """
    base_scheme["age_min"] = 18
    base_scheme["age_max"] = 35

    # 1. Exact minimum bound (18) -> Eligible
    p_min = ProfileInput(age=18, gender="Female", state="All")
    eligible, _, _ = matcher.evaluate_scheme(p_min, base_scheme)
    assert eligible is True

    # 2. Below minimum bound (17) -> Ineligible
    p_below_min = ProfileInput(age=17, gender="Female", state="All")
    eligible, _, _ = matcher.evaluate_scheme(p_below_min, base_scheme)
    assert eligible is False

    # 3. Exact maximum bound (35) -> Eligible
    p_max = ProfileInput(age=35, gender="Female", state="All")
    eligible, _, _ = matcher.evaluate_scheme(p_max, base_scheme)
    assert eligible is True

    # 4. Above maximum bound (36) -> Ineligible
    p_above_max = ProfileInput(age=36, gender="Female", state="All")
    eligible, _, _ = matcher.evaluate_scheme(p_above_max, base_scheme)
    assert eligible is False

def test_rule_income_cap_boundaries(matcher, base_scheme):
    """
    Verify income cap boundary conditions:
    - income == income_max (inclusive, passes)
    - income == income_max + 1 (rejected)
    - income == 0 (passes)
    - income_max == 0 (no cap, any income passes)
    """
    base_scheme["income_max"] = 250000

    # 1. Exact income cap (Rs 2,50,000) -> Eligible
    p_exact = ProfileInput(age=25, gender="Female", income=250000)
    eligible, _, _ = matcher.evaluate_scheme(p_exact, base_scheme)
    assert eligible is True

    # 2. One rupee above income cap (Rs 2,50,001) -> Ineligible
    p_above = ProfileInput(age=25, gender="Female", income=250001)
    eligible, _, _ = matcher.evaluate_scheme(p_above, base_scheme)
    assert eligible is False

    # 3. Zero income -> Eligible
    p_zero = ProfileInput(age=25, gender="Female", income=0)
    eligible, _, _ = matcher.evaluate_scheme(p_zero, base_scheme)
    assert eligible is True

    # 4. Scheme with income_max == 0 (no income ceiling)
    base_scheme["income_max"] = 0
    p_high = ProfileInput(age=25, gender="Female", income=5000000)
    eligible, _, _ = matcher.evaluate_scheme(p_high, base_scheme)
    assert eligible is True

def test_rule_gender_filtering(matcher, base_scheme):
    """Verify gender matching for 'Female', 'Women', 'All', and non-matching."""
    base_scheme["gender"] = "Female"
    assert matcher.evaluate_scheme(ProfileInput(gender="Female"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(gender="Male"), base_scheme)[0] is False
    assert matcher.evaluate_scheme(ProfileInput(gender="Other"), base_scheme)[0] is False

    base_scheme["gender"] = "Women"
    assert matcher.evaluate_scheme(ProfileInput(gender="Female"), base_scheme)[0] is True

    base_scheme["gender"] = "All"
    assert matcher.evaluate_scheme(ProfileInput(gender="Male"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(gender="Female"), base_scheme)[0] is True

def test_rule_state_filtering_and_case_insensitivity(matcher, base_scheme):
    """
    Verify state targeted matching:
    - 'All' / 'All India' matches any user state
    - Specific state matches regardless of case
    - Cross-state rejects
    - Array of eligible states matches
    """
    # 1. Central scheme
    base_scheme["state"] = "All"
    assert matcher.evaluate_scheme(ProfileInput(state="Kerala"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(state="Assam"), base_scheme)[0] is True

    # 2. Targeted single state with case insensitivity
    base_scheme["state"] = "Karnataka"
    base_scheme["eligible_states"] = '["Karnataka"]'
    assert matcher.evaluate_scheme(ProfileInput(state="Karnataka"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(state="karnataka"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(state="KARNATAKA"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(state="Gujarat"), base_scheme)[0] is False

    # 3. Multi-state array
    base_scheme["state"] = "Multi-State"
    base_scheme["eligible_states"] = '["Maharashtra", "Goa"]'
    assert matcher.evaluate_scheme(ProfileInput(state="Maharashtra"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(state="Goa"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(state="Bihar"), base_scheme)[0] is False

def test_rule_caste_category_filtering(matcher, base_scheme):
    """Verify caste matching: 'All', specific caste, and rejection of excluded caste."""
    # 1. All castes eligible
    base_scheme["caste_categories"] = '["All"]'
    assert matcher.evaluate_scheme(ProfileInput(caste="General"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(caste="SC"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(caste="ST"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(caste="OBC"), base_scheme)[0] is True

    # 2. SC/ST targeted scheme
    base_scheme["caste_categories"] = '["SC", "ST"]'
    assert matcher.evaluate_scheme(ProfileInput(caste="SC"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(caste="st"), base_scheme)[0] is True  # case insensitive
    assert matcher.evaluate_scheme(ProfileInput(caste="General"), base_scheme)[0] is False
    assert matcher.evaluate_scheme(ProfileInput(caste="OBC"), base_scheme)[0] is False

def test_rule_residence_filtering(matcher, base_scheme):
    """Verify rural vs urban vs all residence filtering."""
    base_scheme["residence"] = "Rural"
    assert matcher.evaluate_scheme(ProfileInput(residence="Rural"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(residence="All"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(residence="Urban"), base_scheme)[0] is False

    base_scheme["residence"] = "Urban"
    assert matcher.evaluate_scheme(ProfileInput(residence="Urban"), base_scheme)[0] is True
    assert matcher.evaluate_scheme(ProfileInput(residence="Rural"), base_scheme)[0] is False

def test_rule_bpl_and_disability_requirements(matcher, base_scheme):
    """Verify mandatory BPL and disability requirement flags."""
    # BPL required
    base_scheme["requires_bpl"] = True
    assert matcher.evaluate_scheme(ProfileInput(is_bpl=False), base_scheme)[0] is False
    assert matcher.evaluate_scheme(ProfileInput(is_bpl=True), base_scheme)[0] is True

    # Disability required
    base_scheme["requires_bpl"] = False
    base_scheme["requires_disability"] = True
    assert matcher.evaluate_scheme(ProfileInput(has_disability=False), base_scheme)[0] is False
    assert matcher.evaluate_scheme(ProfileInput(has_disability=True), base_scheme)[0] is True

def test_scoring_weights_and_cap(matcher, base_scheme):
    """
    Verify scoring algorithm breakdown:
    - Base score: 50
    - Life stage match: +30
    - State specificity match: +20
    - Income cap present: +10
    - Total capped at 100
    """
    # 1. Base case: Central scheme, no income cap, no matching life stage
    base_scheme["state"] = "All"
    base_scheme["eligible_states"] = '["All"]'
    base_scheme["income_max"] = 0
    base_scheme["life_stage_tags"] = '["senior"]'

    p = ProfileInput(age=25, gender="Female", state="Delhi", life_stage="student")
    eligible, score, _ = matcher.evaluate_scheme(p, base_scheme)
    assert eligible is True
    assert score == 50  # Base 50 only

    # 2. Add income cap (+10) -> score 60
    base_scheme["income_max"] = 200000
    _, score, _ = matcher.evaluate_scheme(p, base_scheme)
    assert score == 60

    # 3. Add life stage match (+30) -> score 90
    base_scheme["life_stage_tags"] = '["student", "youth"]'
    _, score, _ = matcher.evaluate_scheme(p, base_scheme)
    assert score == 90

    # 4. Add state specificity boost (+20) -> 50 + 10 + 30 + 20 = 110 -> capped at 100
    base_scheme["state"] = "Delhi"
    base_scheme["eligible_states"] = '["Delhi"]'
    _, score, _ = matcher.evaluate_scheme(p, base_scheme)
    assert score == 100


# =============================================================================
# 4. Ticket YD-BUG-5.2: Minimum Age & Newborn (Age 0 / Infant) Matching Tests
# =============================================================================

def test_newborn_infant_age_0_matching(matcher):
    """
    Verify age = 0 (Newborn/Infant < 1 yr) qualifies for birth & child schemes
    like Sukanya Samriddhi Yojana (age_min: 0, age_max: 10) and does not fail validation.
    """
    p_infant = ProfileInput(age=0, gender="Female", state="All", life_stage="general")
    res = matcher.match_profile(p_infant)
    assert res.count > 0

    # Sukanya Samriddhi Yojana (age 0-10) should be matched
    ssy_matches = [s for s in res.schemes if s.scheme_id in ["sukanya-samriddhi-yojana", "ssy-central"]]
    assert len(ssy_matches) == 1
    assert any("Infant / Newborn" in reason for reason in ssy_matches[0].match_reasons)

    # Adult-only scheme should NOT be matched for age 0
    adult_matches = [s for s in res.schemes if s.age_min > 0]
    assert len(adult_matches) == 0


# =============================================================================
# 5. Ticket YD-ENG-2.2: Life-Stage Incompatibility Gate Tests
# =============================================================================

def test_senior_profile_incompatible_with_student_and_maternal_schemes(matcher):
    """
    Ticket YD-ENG-2.2 Acceptance Criteria:
    A 65-year-old female profile (Uttarakhand, Senior) must NEVER match student scholarships
    or maternal care schemes.
    """
    p_senior = ProfileInput(age=65, gender="Female", state="Uttarakhand", life_stage="senior", income=30000, is_bpl=True)
    res = matcher.match_profile(p_senior)
    assert res.count > 0

    # Assert 0 student schemes returned
    for scheme in res.schemes:
        tags = [t.lower() for t in scheme.life_stage_tags if isinstance(t, str)] if isinstance(scheme.life_stage_tags, list) else []
        assert "student" not in tags or "general" in tags or "senior" in tags, (
            f"Senior citizen matched exclusive student scheme: {scheme.scheme_id} ({scheme.name})"
        )
        assert scheme.scheme_id not in [
            "gaura-devi-kanya-dhan-yojana",
            "moovalur-ramamirtham-ammaiyar-higher-education-assurance-scheme",
            "kanyashree-prakalpa",
            "post-graduate-indira-gandhi-scholarship-for-single-girl-child",
            "pradhan-mantri-matru-vandana-yojana"
        ]


def test_age_35_excluded_from_exclusive_student_schemes(matcher, base_scheme):
    """
    Users aged > 30 must not be matched with exclusive student schemes.
    """
    base_scheme["life_stage_tags"] = '["student"]'
    base_scheme["age_min"] = 14
    base_scheme["age_max"] = 40  # Even if catalog max age allows up to 40

    p_student_young = ProfileInput(age=20, gender="Female", state="All", life_stage="student")
    eligible_young, _, _ = matcher.evaluate_scheme(p_student_young, base_scheme)
    assert eligible_young is True

    p_student_older = ProfileInput(age=35, gender="Female", state="All", life_stage="student")
    eligible_older, _, _ = matcher.evaluate_scheme(p_student_older, base_scheme)
    assert eligible_older is False


def test_maternal_scheme_age_and_senior_incompatibility(matcher, base_scheme):
    """
    Maternal schemes must be strictly gated between 18 and 50 years, and never match senior profiles.
    """
    base_scheme["life_stage_tags"] = '["maternal"]'
    base_scheme["category"] = "Maternal & Child Health"
    base_scheme["age_min"] = 0
    base_scheme["age_max"] = 100

    # 1. Age 25 pregnant woman -> Eligible
    p_maternal = ProfileInput(age=25, gender="Female", state="All", life_stage="maternal")
    assert matcher.evaluate_scheme(p_maternal, base_scheme)[0] is True

    # 2. Age 16 minor (general/student) -> Ineligible for maternal scheme
    p_minor = ProfileInput(age=16, gender="Female", state="All", life_stage="student")
    assert matcher.evaluate_scheme(p_minor, base_scheme)[0] is False

    # 3. Age 55 woman (general) -> Ineligible for maternal scheme
    p_older = ProfileInput(age=55, gender="Female", state="All", life_stage="general")
    assert matcher.evaluate_scheme(p_older, base_scheme)[0] is False

    # 4. Senior citizen (age 65, senior) -> Ineligible for maternal scheme
    p_senior = ProfileInput(age=65, gender="Female", state="All", life_stage="senior")
    assert matcher.evaluate_scheme(p_senior, base_scheme)[0] is False
