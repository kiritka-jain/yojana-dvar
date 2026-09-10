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
    ssy = matcher.get_scheme_by_id("ssy-central")
    assert ssy is not None

    # 5 year old girl should qualify for SSY
    profile_child = ProfileInput(age=5, gender="Female", state="All", life_stage="student")
    is_e_child, score_child, _ = matcher.evaluate_scheme(profile_child, ssy)
    assert is_e_child is True
    assert score_child >= 50
    
    # 15 year old girl should NOT qualify for SSY (age max is 10)
    profile_teen = ProfileInput(age=15, gender="Female", state="All", life_stage="student")
    is_e_teen, _, _ = matcher.evaluate_scheme(profile_teen, ssy)
    assert is_e_teen is False

def test_income_max_boundary(matcher):
    """Test annual family income cap filtering on real catalog."""
    # Low Income woman (Rs 50,000) qualifies for PMMVY (max 2,50,000)
    profile_low_income = ProfileInput(age=25, gender="Female", state="All", income=50000, is_bpl=True, life_stage="maternal")
    res_low = matcher.match_profile(profile_low_income)
    pmmvy_matches = [s for s in res_low.schemes if s.scheme_id in ["pradhan-mantri-matru-vandana-yojana", "pmmvy-central"]]
    assert len(pmmvy_matches) >= 1

    # High Income woman (Rs 10,00,000) should NOT qualify for income-capped PMMVY
    profile_high_income = ProfileInput(age=25, gender="Female", state="All", income=1000000, is_bpl=False, life_stage="maternal")
    res_high = matcher.match_profile(profile_high_income)
    pmmvy_high_matches = [s for s in res_high.schemes if s.scheme_id in ["pradhan-mantri-matru-vandana-yojana", "pmmvy-central"]]
    assert len(pmmvy_high_matches) == 0

def test_state_specific_filtering(matcher):
    """Test state targeted scheme filtering on real catalog (UP vs TN)."""
    up_schemes = [s for s in matcher.get_catalog() if s.get("state", "").lower() == "uttar pradesh"]
    assert len(up_schemes) >= 1
    sample_up = up_schemes[0]
    sample_age = int(sample_up.get("age_min", 25)) or 25

    # UP resident should be eligible for state rule check
    profile_up = ProfileInput(age=sample_age, gender="Female", state="Uttar Pradesh", life_stage="general")
    profile_tn = ProfileInput(age=sample_age, gender="Female", state="Tamil Nadu", life_stage="general")
    
    is_e_tn, _, _ = matcher.evaluate_scheme(profile_tn, sample_up)
    assert is_e_tn is False

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
    ssy = matcher.get_scheme_by_id("ssy-central")
    assert ssy is not None
    is_e_infant, _, reasons = matcher.evaluate_scheme(p_infant, ssy)
    assert is_e_infant is True
    assert any("Infant / Newborn" in reason for reason in reasons)

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


def test_marital_status_widow_scheme_rules(matcher, base_scheme):
    """
    Test widow scheme matching:
    - Widow woman gets priority match and Death Certificate reminder.
    - Married/unmarried applicants are excluded from exclusive widow pension schemes.
    """
    base_scheme["name"] = "Indira Gandhi National Widow Pension Scheme"
    base_scheme["category"] = "Widow & Destitute Support"
    base_scheme["beneficiary_type"] = "Widows aged 40-79 years living below poverty line"
    base_scheme["life_stage_tags"] = '["widow"]'
    base_scheme["age_min"] = 40
    base_scheme["age_max"] = 79

    # 1. Widow applicant qualifies with high score and reason
    p_widow = ProfileInput(age=45, gender="Female", state="All", marital_status="widow", life_stage="widow", is_bpl=True)
    eligible_widow, score_widow, reasons_widow = matcher.evaluate_scheme(p_widow, base_scheme)
    assert eligible_widow is True
    assert score_widow >= 75
    assert any("Death Certificate" in r for r in reasons_widow)

    # 2. Married applicant is excluded from exclusive widow pension scheme
    p_married = ProfileInput(age=45, gender="Female", state="All", marital_status="married", life_stage="general", is_bpl=True)
    eligible_married, _, _ = matcher.evaluate_scheme(p_married, base_scheme)
    assert eligible_married is False


def test_marital_status_intercaste_marriage_rules(matcher, base_scheme):
    """
    Test inter-caste marriage scheme rules and reason generation.
    """
    base_scheme["name"] = "Dr. Ambedkar Scheme for Social Integration through Inter-Caste Marriages"
    base_scheme["category"] = "Inter-caste Marriage Incentive"
    base_scheme["beneficiary_type"] = "Inter-caste married couples where one spouse belongs to SC category"
    base_scheme["life_stage_tags"] = '["general"]'
    base_scheme["age_min"] = 18
    base_scheme["age_max"] = 60

    # 1. Inter-caste married applicant qualifies with marriage certificate reason
    p_intercaste = ProfileInput(age=25, gender="Female", state="All", marital_status="intercaste_marriage", caste="SC")
    eligible_ic, score_ic, reasons_ic = matcher.evaluate_scheme(p_intercaste, base_scheme)
    assert eligible_ic is True
    assert any("Marriage Certificate" in r for r in reasons_ic)

    # 2. Unmarried applicant does not qualify for inter-caste marriage scheme
    p_unmarried = ProfileInput(age=25, gender="Female", state="All", marital_status="unmarried", caste="SC")
    eligible_unm, _, _ = matcher.evaluate_scheme(p_unmarried, base_scheme)
    assert eligible_unm is False


# =============================================================================
# 3. Persona Regression & Reverse Life-Stage Gating Tests (TICKET-203)
# =============================================================================

def test_10_year_old_girl_persona_exclusion_from_adult_and_pension_schemes(matcher):
    """
    Persona Test: 10-year-old girl in Maharashtra must receive ONLY age-appropriate schemes.
    Zero working women hostels, pension schemes, mudra loans, marriage schemes, or safai karamchari loans.
    """
    girl_profile = ProfileInput(
        age=10,
        gender="Female",
        state="Maharashtra",
        life_stage="all",
        marital_status="unmarried",
        caste="General",
        income=100000,
        occupation="Student",
        limit=50
    )

    res = matcher.match_profile(girl_profile)
    assert res.count > 0

    banned_adult_keywords = [
        "working women", "working woman", "pension", "mudra",
        "stand up india", "safai karamchari", "marriage assistance",
        "vivah hetu", "wedding aid"
    ]

    for s in res.schemes:
        name_lower = s.name.lower()
        for kw in banned_adult_keywords:
            if kw in name_lower:
                # Ensure it's not a false positive like "girl child"
                assert any(ok in name_lower for ok in ["girl child", "balika", "sukanya", "school", "student", "education", "scholarship"]), (
                    f"Ineligible scheme '{s.name}' matched for 10-year-old girl (keyword: {kw})"
                )


def test_restrictive_occupation_gate(matcher, base_scheme):
    """
    Test that schemes for specialized occupations (safai karamcharis, construction workers)
    reject unqualified profiles (e.g. students, homemakers, salaried civilians).
    """
    base_scheme["name"] = "Credit Facility for Safai Karamcharis"
    base_scheme["eligibility_text"] = "Financial aid for safai karamchari families"
    base_scheme["beneficiary_type"] = "Safai Karamcharis / Sanitation Workers"
    base_scheme["age_min"] = 18
    base_scheme["age_max"] = 65

    # 1. Student applicant is rejected
    p_student = ProfileInput(age=20, gender="Female", state="All", occupation="Student", life_stage="student")
    assert matcher.evaluate_scheme(p_student, base_scheme)[0] is False

    # 2. Daily wage labor applicant is accepted
    p_worker = ProfileInput(age=30, gender="Female", state="All", occupation="Daily Wage Labor", life_stage="general")
    assert matcher.evaluate_scheme(p_worker, base_scheme)[0] is True


def test_reverse_life_stage_age_gate_general_profile(matcher, base_scheme):
    """
    Test that even if user has life_stage='all', reverse demographic sanity gates
    block minors (<18) from maternal/marriage/hostel schemes and under-60 from senior pensions.
    """
    # Maternal scheme
    base_scheme["name"] = "Mukhyamantri Kanya Vivah Yojana"
    base_scheme["life_stage_tags"] = '["maternal"]'
    base_scheme["category"] = "Maternal & Child Welfare"
    base_scheme["age_min"] = 18
    base_scheme["age_max"] = 45

    p_child_all = ProfileInput(age=10, gender="Female", state="All", life_stage="all", marital_status="unmarried")
    assert matcher.evaluate_scheme(p_child_all, base_scheme)[0] is False

    # Senior pension scheme
    senior_scheme = {
        "scheme_id": "old-age-pension",
        "name": "Indira Gandhi National Old Age Pension Scheme",
        "is_active": True,
        "gender": "Female",
        "age_min": 60,
        "age_max": 100,
        "state": "All",
        "eligible_states": '["All"]',
        "caste_categories": '["All"]',
        "income_max": 0,
        "residence": "All",
        "requires_bpl": False,
        "requires_disability": False,
        "life_stage_tags": '["senior"]'
    }

    p_young_adult = ProfileInput(age=25, gender="Female", state="All", life_stage="all")
    assert matcher.evaluate_scheme(p_young_adult, senior_scheme)[0] is False


# =============================================================================
# 5. Pan-India Minor & Child Labour Statutory Guardrails (EPIC 1)
# =============================================================================

def test_minor_student_rejected_from_aatmanirbhar_gujarat_msme(matcher, base_scheme):
    """
    Test that an age 10 student from Gujarat is strictly disqualified from
    Aatmanirbhar Gujarat MSME assistance and industrial subsidy schemes.
    """
    base_scheme["name"] = "Aatmanirbhar Gujarat Scheme for assistance to MSMEs: Assistance for Quality Certification"
    base_scheme["category"] = "Business & Entrepreneurship"
    base_scheme["eligibility_text"] = "Assistance for MSMEs to obtain quality certification like ISO, ZED, etc."
    base_scheme["state"] = "Gujarat"
    base_scheme["eligible_states"] = '["Gujarat"]'
    base_scheme["life_stage_tags"] = '["entrepreneur"]'
    base_scheme["age_min"] = 0  # Even if catalog had bad default 0
    base_scheme["age_max"] = 100

    profile_minor = ProfileInput(age=10, gender="Female", state="Gujarat", life_stage="student", occupation="Student")
    is_eligible, score, _ = matcher.evaluate_scheme(profile_minor, base_scheme)
    assert is_eligible is False
    assert score == 0


def test_minor_student_rejected_from_agricultural_skill_and_aquaculture(matcher, base_scheme):
    """
    Test that minors and students are disqualified from agricultural training
    and brackish water aquaculture commercial schemes across India.
    """
    # 1. Agricultural Skill Development
    agri_scheme = dict(base_scheme)
    agri_scheme["name"] = "Agricultural Skill Development Training Programme For Women Farmers And Farmers"
    agri_scheme["category"] = "Agriculture, Rural & Environment"
    agri_scheme["eligibility_text"] = "Training for farmers and farm laborers in agricultural techniques"
    agri_scheme["age_min"] = 0
    agri_scheme["age_max"] = 70

    p_child = ProfileInput(age=10, gender="Female", state="Gujarat", life_stage="student", occupation="Student")
    assert matcher.evaluate_scheme(p_child, agri_scheme)[0] is False

    # 2. Brackish Water Aquaculture
    aqua_scheme = dict(base_scheme)
    aqua_scheme["name"] = "Development of Brackish Water Aquaculture"
    aqua_scheme["category"] = "Agriculture, Rural & Environment"
    aqua_scheme["eligibility_text"] = "Financial subsidy for brackish water fish and shrimp farming units"
    aqua_scheme["age_min"] = 0
    aqua_scheme["age_max"] = 70

    assert matcher.evaluate_scheme(p_child, aqua_scheme)[0] is False


def test_pan_india_minor_gating_consistency(matcher, base_scheme):
    """
    Verifies that the statutory minor hard-gate operates uniformly across
    all Indian states (Gujarat, Maharashtra, Uttar Pradesh, Tamil Nadu, etc.).
    """
    commercial_scheme = dict(base_scheme)
    commercial_scheme["name"] = "State MSME Capital Subsidy Scheme"
    commercial_scheme["category"] = "Business & Entrepreneurship"
    commercial_scheme["eligibility_text"] = "Term loan subsidy for micro and small manufacturing units"
    commercial_scheme["age_min"] = 0
    commercial_scheme["age_max"] = 65

    states_to_test = ["Gujarat", "Maharashtra", "Uttar Pradesh", "Tamil Nadu", "Bihar", "Karnataka", "West Bengal"]

    for state in states_to_test:
        commercial_scheme["state"] = state
        commercial_scheme["eligible_states"] = f'["{state}"]'
        
        # Minor age 10 student must be rejected in all states
        p_minor = ProfileInput(age=10, gender="Female", state=state, life_stage="student")
        assert matcher.evaluate_scheme(p_minor, commercial_scheme)[0] is False, f"Failed for state: {state}"


def test_minor_student_permitted_for_child_scholarships(matcher, base_scheme):
    """
    Test that child education and scholarship schemes remain eligible for minors (<18).
    """
    scholarship_scheme = dict(base_scheme)
    scholarship_scheme["name"] = "Pre-Matric Scholarship for Minorities and Girl Students"
    scholarship_scheme["category"] = "Education & Learning"
    scholarship_scheme["eligibility_text"] = "Financial grant for school students from class 1 to 10"
    scholarship_scheme["life_stage_tags"] = '["student"]'
    scholarship_scheme["age_min"] = 6
    scholarship_scheme["age_max"] = 16

    p_student = ProfileInput(age=10, gender="Female", state="Gujarat", life_stage="student", occupation="Student")
    is_eligible, score, reasons = matcher.evaluate_scheme(p_student, scholarship_scheme)
    assert is_eligible is True
    assert score >= 50


def test_real_catalog_minor_age_10_student_zero_commercial_schemes(matcher):
    """
    Integration Test: Matches an age 10 student against the live 3,288-scheme catalog.
    Verifies that NO commercial enterprise, MSME, industrial, loan, or aquaculture schemes are returned.
    """
    profile = ProfileInput(age=10, gender="Female", state="Gujarat", life_stage="student", limit=50)
    res = matcher.match_profile(profile)


    assert res.count > 0, "Expected at least 1 educational/child scheme for age 10"

    commercial_terms = [
        "msme", "micro enterprise", "small enterprise", "medium enterprise",
        "mega industry", "large industry", "thrust sector", "industrial unit",
        "term loan", "working capital", "interest subsidy", "capital subsidy",
        "sgst reimbursement", "stamp duty", "epf reimbursement", "patent registration",
        "quality certification", "power connection charges", "aquaculture",
        "brackish water", "training programme for farmers"
    ]

    for scheme in res.schemes:
        name_lower = scheme.name.lower()
        cat_lower = scheme.category.lower()
        desc_lower = scheme.description.lower()
        full_text = f"{name_lower} {cat_lower} {desc_lower}"

        # Must not be Business & Entrepreneurship
        assert "business & entrepreneurship" not in cat_lower, f"Violating scheme matched: {scheme.name}"

        # Must not match commercial enterprise terms
        for term in commercial_terms:
            assert term not in name_lower, f"Commercial term '{term}' found in matched scheme '{scheme.name}'"


def test_real_catalog_pan_india_states_minor_safety(matcher):
    """
    Pan-India Integration Test: Scans major states across North, South, East, West,
    and Central India to verify consistent zero commercial leakage for minors.
    """
    pan_india_states = [
        "Gujarat", "Maharashtra", "Uttar Pradesh", "Tamil Nadu", "Bihar",
        "Karnataka", "Rajasthan", "West Bengal", "Madhya Pradesh", "Kerala",
        "Assam", "Odisha", "Punjab", "Haryana", "Telangana", "Andhra Pradesh"
    ]

    for state in pan_india_states:
        profile = ProfileInput(age=10, gender="Female", state=state, life_stage="student", limit=50)
        res = matcher.match_profile(profile)

        for scheme in res.schemes:
            assert "business & entrepreneurship" not in scheme.category.lower(), (
                f"State '{state}' leaked business scheme '{scheme.name}' to minor"
            )
            assert "msme" not in scheme.name.lower(), (
                f"State '{state}' leaked MSME scheme '{scheme.name}' to minor"
            )


def test_real_catalog_adolescent_16_yr_commercial_exclusion(matcher):
    """
    Adolescent Boundary Test: Verifies that a 16-year-old high school student
    remains protected from commercial debt/MSME/industrial schemes.
    """
    profile_teen = ProfileInput(age=16, gender="Female", state="Gujarat", life_stage="student", limit=50)
    res = matcher.match_profile(profile_teen)

    for scheme in res.schemes:
        assert "business & entrepreneurship" not in scheme.category.lower()
        if "scholarship" not in scheme.name.lower() and "children" not in scheme.name.lower():
            assert "msme" not in scheme.name.lower()
def test_delhi_ladli_14_year_old_girl_eligibility(matcher):
    """
    Acceptance Test: A 14-year-old unmarried girl residing in Delhi
    MUST be eligible for Delhi Ladli Scheme (milestone Class 9th).
    """
    profile = ProfileInput(
        age=14,
        gender="Female",
        state="Delhi",
        marital_status="unmarried",
        life_stage="student",
        income=50000
    )
    res = matcher.match_profile(profile)
    matched_ids = [s.scheme_id for s in res.schemes]
    assert "delhi-ladli-scheme" in matched_ids, f"Delhi Ladli Scheme missing for 14yo girl. Matched IDs: {matched_ids}"


def test_delhi_ladli_college_unmarried_student_eligibility(matcher):
    """
    Acceptance Test: A 20-year-old unmarried girl student in Delhi
    pursuing Diploma/Graduation MUST be eligible for Delhi Ladli Scheme.
    """
    profile = ProfileInput(
        age=20,
        gender="Female",
        state="Delhi",
        marital_status="unmarried",
        life_stage="student",
        income=60000
    )
    res = matcher.match_profile(profile)
    matched_ids = [s.scheme_id for s in res.schemes]
    assert "delhi-ladli-scheme" in matched_ids, f"Delhi Ladli Scheme missing for 20yo student. Matched IDs: {matched_ids}"


def test_delhi_ladli_newborn_infant_eligibility(matcher):
    """
    Acceptance Test: A newborn baby girl (age 0) in Delhi is eligible at birth stage.
    """
    profile = ProfileInput(
        age=0,
        gender="Female",
        state="Delhi",
        marital_status="unmarried",
        life_stage="child",
        income=40000
    )
    res = matcher.match_profile(profile)
    matched_ids = [s.scheme_id for s in res.schemes]
    assert "delhi-ladli-scheme" in matched_ids, f"Delhi Ladli Scheme missing for newborn. Matched IDs: {matched_ids}"


def test_delhi_ladli_married_and_overage_disqualification(matcher):
    """
    Acceptance Test: Married individuals or individuals aged >= 25 are strictly disqualified.
    """
    # 1. Married at 18
    p_married = ProfileInput(
        age=18,
        gender="Female",
        state="Delhi",
        marital_status="married",
        income=50000
    )
    res_married = matcher.match_profile(p_married)
    matched_married_ids = [s.scheme_id for s in res_married.schemes]
    assert "delhi-ladli-scheme" not in matched_married_ids, "Delhi Ladli Scheme must not match married individual"

    # 2. Age 25 (over upper limit of < 25)
    p_overage = ProfileInput(
        age=25,
        gender="Female",
        state="Delhi",
        marital_status="unmarried",
        income=50000
    )
    res_overage = matcher.match_profile(p_overage)
    matched_overage_ids = [s.scheme_id for s in res_overage.schemes]
    assert "delhi-ladli-scheme" not in matched_overage_ids, "Delhi Ladli Scheme must not match age >= 25"






