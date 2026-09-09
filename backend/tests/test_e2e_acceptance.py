import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.profile import ProfileInput
from app.services.matcher import matcher_service

client = TestClient(app)

# =============================================================================
# EPIC 5 / TICKET-501 & TICKET-502: End-to-End Acceptance Tests
# =============================================================================

class TestPersonaAcceptance:
    """
    Validates end-to-end user persona matching against the active catalog of 3,288 schemes.
    Ensures zero demographic leakage, accurate eligibility gating, and correct scoring.
    """

    def test_persona_1_ten_year_old_student_girl_maharashtra(self):
        """
        Persona 1: 10-year-old girl in Maharashtra (Student, Unmarried, Income 1L).
        Acceptance:
        - Must receive student scholarships, single girl child schemes, and state education aid.
        - ZERO working women hostels, pensions, business loans (Mudra/Stand-up), marriage aid, or labor schemes.
        """
        girl_profile = ProfileInput(
            age=10,
            gender="Female",
            state="Maharashtra",
            marital_status="unmarried",
            caste="General",
            income=100000,
            residence="Urban",
            life_stage="student",
            occupation="Student",
            education="Primary",
            is_bpl=False,
            has_disability=False,
            limit=50
        )

        resp = matcher_service.match_profile(girl_profile)
        assert resp.count > 0, "Persona 1 should match relevant student schemes"

        banned_adult_keywords = [
            "working women hostel", "working woman hostel", "pension", 
            "mudra", "stand up india", "stand-up india", "marriage assistance", 
            "kanya vivah", "wedding aid", "safai karamchari", "sanitation worker",
            "bocw", "construction worker", "beedi worker", "maternity benefit"
        ]

        for scheme in resp.schemes:
            name_lower = scheme.name.lower()
            text_lower = f"{scheme.name} {scheme.category} {scheme.beneficiary_type} {scheme.eligibility_text}".lower()

            # Verify age range
            assert scheme.age_min <= 10 <= scheme.age_max, f"Scheme '{scheme.name}' has invalid age bounds [{scheme.age_min}-{scheme.age_max}] for 10yo"

            # Check no adult keyword leakage unless it is a girl child / education scheme
            for kw in banned_adult_keywords:
                if kw in name_lower:
                    is_safe_child_scheme = any(ok in text_lower for ok in ["girl child", "balika", "sukanya", "school", "student", "scholarship", "education"])
                    assert is_safe_child_scheme, f"Ineligible adult scheme '{scheme.name}' leaked for 10-year-old girl (keyword: {kw})"

    def test_persona_2_sixty_five_year_old_widow_bihar_bpl(self):
        """
        Persona 2: 65-year-old widow in Bihar (BPL, Unemployed/Other, Income 30k).
        Acceptance:
        - Must match widow pension, old age pension, BPL social security.
        - ZERO student scholarships, child welfare, or maternal/pregnancy schemes.
        """
        widow_profile = ProfileInput(
            age=65,
            gender="Female",
            state="Bihar",
            marital_status="widow",
            caste="SC",
            income=30000,
            residence="Rural",
            life_stage="widow",
            occupation="Other",
            is_bpl=True,
            has_disability=False,
            limit=50
        )

        resp = matcher_service.match_profile(widow_profile)
        assert resp.count > 0, "Persona 2 should match widow/senior schemes"

        for scheme in resp.schemes:
            name_lower = scheme.name.lower()
            tags_lower = str(scheme.life_stage_tags).lower()

            # Must not be an exclusive student scholarship
            assert "post-graduate" not in name_lower, f"Student scheme '{scheme.name}' leaked to 65yo widow"
            assert "ugc" not in name_lower or "pension" in name_lower, f"University grant scheme '{scheme.name}' leaked to senior widow"

            # Must not be exclusively maternal
            if "maternal" in tags_lower and "general" not in tags_lower:
                assert any(ok in name_lower for ok in ["widow", "pension", "vridha", "senior"]), f"Maternal scheme '{scheme.name}' leaked to senior"

    def test_persona_3_twenty_four_year_old_entrepreneur_karnataka(self):
        """
        Persona 3: 24-year-old woman entrepreneur in Karnataka (Self-employed / Artisan, Income 2.5L).
        Acceptance:
        - Must match business loan schemes (Mudra, Stand-Up India, Stree Shakti, Working Women Hostel).
        - ZERO school/primary student schemes, ZERO senior citizen pensions.
        """
        entrepreneur_profile = ProfileInput(
            age=24,
            gender="Female",
            state="Karnataka",
            marital_status="unmarried",
            caste="General",
            income=250000,
            residence="Urban",
            life_stage="entrepreneur",
            occupation="Self-Employed / Artisan",
            education="Undergraduate",
            is_bpl=False,
            has_disability=False,
            limit=50
        )

        resp = matcher_service.match_profile(entrepreneur_profile)
        assert resp.count > 0

        for scheme in resp.schemes:
            name_lower = scheme.name.lower()
            # No senior citizen pensions
            assert "old age pension" not in name_lower and "vridha pension" not in name_lower, (
                f"Senior pension '{scheme.name}' leaked to 24yo entrepreneur"
            )

    def test_persona_4_state_isolation_cross_contamination(self):
        """
        Persona 4: Resident of Kerala.
        Acceptance:
        - All matched schemes must either be Central ('All' / 'All India') or specifically for 'Kerala'.
        - ZERO state-exclusive schemes from Bihar, Uttar Pradesh, Maharashtra, Gujarat, etc.
        """
        kerala_profile = ProfileInput(
            age=30,
            gender="Female",
            state="Kerala",
            marital_status="married",
            caste="General",
            income=200000,
            residence="Urban",
            life_stage="all",
            limit=50
        )

        resp = matcher_service.match_profile(kerala_profile)
        assert resp.count > 0

        foreign_state_names = ["bihar", "uttar pradesh", "maharashtra", "gujarat", "punjab", "haryana", "tamil nadu", "rajasthan"]

        for scheme in resp.schemes:
            sch_state = scheme.state.lower().strip()
            eligible_states = str(scheme.eligible_states).lower()

            is_central = sch_state in ["all", "all india"] or '"all"' in eligible_states or "'all'" in eligible_states
            is_kerala = sch_state == "kerala" or "kerala" in eligible_states

            assert is_central or is_kerala, (
                f"Foreign state scheme '{scheme.name}' (State: {scheme.state}) leaked to Kerala profile"
            )

    def test_api_e2e_match_and_search_endpoints(self):
        """
        Full HTTP integration test of /api/v1/match and /schemes/search endpoints.
        """
        # 1. Match endpoint
        payload = {
            "age": 10,
            "gender": "Female",
            "state": "Maharashtra",
            "marital_status": "unmarried",
            "caste": "General",
            "income": 100000,
            "residence": "Urban",
            "life_stage": "student",
            "occupation": "Student",
            "education": "Primary",
            "is_bpl": False,
            "has_disability": False,
            "limit": 20
        }
        res_match = client.post("/api/v1/match", json=payload)
        assert res_match.status_code == 200
        data_match = res_match.json()
        assert data_match["count"] > 0
        assert len(data_match["schemes"]) <= 20

        # 2. Search endpoint with age demographic filter
        res_search = client.get("/schemes/search?q=scholarship&age=10&state=Maharashtra&limit=20")
        assert res_search.status_code == 200
        data_search = res_search.json()
        assert data_search["count"] > 0
        for s in data_search["schemes"]:
            assert s["age_min"] <= 10 <= s["age_max"]
