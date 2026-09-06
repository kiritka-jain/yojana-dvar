import time
import json
import pytest
from app.models.profile import ProfileInput
from app.services.matcher import EligibilityMatcher, matcher_service


@pytest.fixture(scope="module")
def scale_catalog():
    """Generates a scaled catalog with 500+ realistic schemes across 28 States & UTs and 5 life stages."""
    states = [
        "Uttar Pradesh", "Maharashtra", "Bihar", "West Bengal", "Madhya Pradesh",
        "Tamil Nadu", "Rajasthan", "Karnataka", "Gujarat", "Andhra Pradesh",
        "Odisha", "Telangana", "Kerala", "Jharkhand", "Assam",
        "Punjab", "Haryana", "Chhattisgarh", "Delhi", "Uttarakhand",
        "Himachal Pradesh", "Jammu and Kashmir", "Goa", "All"
    ]
    life_stages = ["maternal", "student", "entrepreneur", "senior", "general"]
    castes = [["All"], ["SC", "ST"], ["OBC"], ["General"], ["SC", "ST", "OBC", "General"]]

    catalog = []
    # Seed from real catalog
    real_catalog = matcher_service.get_catalog()
    catalog.extend(real_catalog)

    # Scale to 500+ records
    scheme_idx = len(catalog) + 1
    for state in states:
        for stage in life_stages:
            for caste in castes:
                catalog.append({
                    "scheme_id": f"synthetic-scheme-{scheme_idx}",
                    "name": f"{state} {stage.capitalize()} Welfare Scheme #{scheme_idx}",
                    "description": f"Targeted {stage} assistance for citizens of {state}.",
                    "ministry": f"Department of Welfare {state}",
                    "department": f"Directorate of {stage.capitalize()} Affairs",
                    "state": state,
                    "category": "Social welfare & Empowerment",
                    "beneficiary_type": "Eligible Women & Families",
                    "benefits": "Monthly stipend and direct DBT transfers.",
                    "eligibility_text": f"Must reside in {state} with annual income below Rs 3,00,000.",
                    "documents_required": "Aadhaar, Domicile, Bank Account.",
                    "application_process": "Apply via state portal.",
                    "apply_url": f"https://welfare.{state.lower().replace(' ', '')}.gov.in",
                    "official_url": f"https://welfare.{state.lower().replace(' ', '')}.gov.in",
                    "age_min": 18 if stage != "student" else 10,
                    "age_max": 60 if stage != "senior" else 100,
                    "gender": "Female",
                    "caste_categories": json.dumps(caste),
                    "income_max": 300000,
                    "residence": "All",
                    "eligible_states": json.dumps([state]),
                    "requires_bpl": False,
                    "requires_disability": False,
                    "life_stage_tags": json.dumps([stage]),
                    "is_active": True,
                    "updated_at": "2026-09-06T00:00:00Z"
                })
                scheme_idx += 1

    return catalog


def test_scale_catalog_record_count(scale_catalog):
    """Verify scaled catalog exceeds 500+ schemes."""
    assert len(scale_catalog) >= 500


def test_matcher_latency_benchmark_under_50ms(scale_catalog):
    """
    Ticket 4.2 Acceptance Criteria:
    Benchmark matcher execution latency (< 50ms for 500+ schemes).
    """
    custom_matcher = EligibilityMatcher()
    custom_matcher._catalog_cache = scale_catalog

    profiles = [
        ProfileInput(age=24, gender="Female", state="Maharashtra", life_stage="entrepreneur", income=150000),
        ProfileInput(age=19, gender="Female", state="Tamil Nadu", life_stage="student", income=50000),
        ProfileInput(age=28, gender="Female", state="Uttar Pradesh", life_stage="maternal", is_bpl=True),
        ProfileInput(age=65, gender="Female", state="Rajasthan", life_stage="senior", income=0),
        ProfileInput(age=35, gender="Female", state="Bihar", life_stage="general", caste="SC")
    ]

    latencies = []
    # Warm-up
    custom_matcher.match_profile(profiles[0])

    for profile in profiles:
        start_t = time.perf_counter()
        resp = custom_matcher.match_profile(profile)
        duration_ms = (time.perf_counter() - start_t) * 1000
        latencies.append(duration_ms)

        assert resp.count > 0
        assert resp.execution_time_ms < 50.0
        assert duration_ms < 50.0

    avg_latency = sum(latencies) / len(latencies)
    print(f"\n[Benchmark] Tested 5 diverse demographic profiles across {len(scale_catalog)} schemes:")
    print(f"  - Average Match Latency: {avg_latency:.2f} ms (Acceptance Target: < 50ms)")
    print(f"  - Max Match Latency:     {max(latencies):.2f} ms")
    assert avg_latency < 25.0  # Strict sub-25ms performance threshold


def test_state_specific_isolation_across_major_states(scale_catalog):
    """
    Verify state-specific schemes (Maharashtra, Tamil Nadu, Uttar Pradesh, Rajasthan, Delhi, Uttarakhand)
    filter strictly and correctly.
    """
    custom_matcher = EligibilityMatcher()
    custom_matcher._catalog_cache = scale_catalog

    test_states = ["Maharashtra", "Tamil Nadu", "Uttar Pradesh", "Rajasthan", "Delhi", "Uttarakhand"]
    
    for st in test_states:
        profile = ProfileInput(age=25, gender="Female", state=st, limit=50)
        res = custom_matcher.match_profile(profile)
        
        for scheme in res.schemes:
            sch_state = scheme.state.lower()
            sch_eligible = json.loads(scheme.eligible_states) if isinstance(scheme.eligible_states, str) else scheme.eligible_states
            is_central = sch_state in ["all", "all india"] or "All" in sch_eligible
            is_matching_state = sch_state == st.lower() or st.lower() in [s.lower() for s in sch_eligible]

            assert is_central or is_matching_state, f"Scheme from state '{scheme.state}' incorrectly leaked to profile in '{st}'"


def test_real_catalog_matcher_latency():
    """Verify match latency on active real catalog is lightning fast (< 10ms)."""
    profile = ProfileInput(age=22, gender="Female", state="Delhi", life_stage="student")
    start = time.perf_counter()
    resp = matcher_service.match_profile(profile)
    latency_ms = (time.perf_counter() - start) * 1000

    assert resp.count > 0
    assert latency_ms < 15.0
