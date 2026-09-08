import pytest
from app.models.profile import ProfileInput
from app.services.matcher import EligibilityMatcher

INDIAN_STATES_ALL = [
    # 28 States
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    # 8 Union Territories
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
]

@pytest.fixture
def matcher():
    return EligibilityMatcher()

def test_all_28_states_and_8_uts_coverage(matcher):
    """Verify that matcher executes cleanly without exception for all 36 Indian States and UTs."""
    assert len(INDIAN_STATES_ALL) == 36
    
    for state in INDIAN_STATES_ALL:
        profile = ProfileInput(
            age=25,
            gender="Female",
            state=state,
            income=100000,
            life_stage="general"
        )
        res = matcher.match_profile(profile)
        assert res.count > 0, f"Expected matches for {state}"
        
        # Every matched scheme must either be nationwide Central or specific to this state
        for s in res.schemes:
            is_central = s.state.lower() in ["all", "all india"] or "All" in s.eligible_states
            is_state_target = s.state.lower() == state.lower() or any(st.lower() == state.lower() for st in s.eligible_states)
            assert is_central or is_state_target, f"Scheme {s.scheme_id} ({s.state}) incorrectly matched for profile state {state}"

def test_central_plus_state_specific_inclusion(matcher):
    """Verify that selecting a state with specific schemes returns Central + State schemes."""
    # Test Maharashtra with is_bpl=True
    profile_mh = ProfileInput(age=30, gender="Female", state="Maharashtra", income=100000, is_bpl=True, life_stage="general", limit=50)
    res_mh = matcher.match_profile(profile_mh)
    
    mh_specific = [s for s in res_mh.schemes if s.state.lower() == "maharashtra"]
    central_schemes = [s for s in res_mh.schemes if s.state.lower() in ["all", "all india"]]
    
    assert len(central_schemes) > 0
    assert len(mh_specific) >= 1

def test_state_isolation_between_states(matcher):
    """Verify that state-specific schemes do not leak into another state."""
    profile_up = ProfileInput(age=12, gender="Female", state="Uttar Pradesh", income=100000, life_stage="student", limit=50)
    res_up = matcher.match_profile(profile_up)
    
    up_specific = [s for s in res_up.schemes if "kanya" in s.scheme_id or "sumangala" in s.scheme_id or "up" in s.scheme_id]
    assert len(up_specific) >= 1
    
    profile_tn = ProfileInput(age=12, gender="Female", state="Tamil Nadu", income=100000, life_stage="student", limit=50)
    res_tn = matcher.match_profile(profile_tn)
    up_in_tn = [s for s in res_tn.schemes if "kanya-sumangala-yojana" in s.scheme_id]
    assert len(up_in_tn) == 0

def test_union_territory_matching(matcher):
    """Verify UT matching (e.g. Delhi free bus scheme)."""
    profile_delhi = ProfileInput(age=25, gender="Female", state="Delhi", income=150000, life_stage="general", limit=50)
    res_delhi = matcher.match_profile(profile_delhi)
    
    delhi_schemes = [s for s in res_delhi.schemes if s.state.lower() == "delhi"]
    assert len(delhi_schemes) >= 1
    
    profile_punjab = ProfileInput(age=25, gender="Female", state="Punjab", income=150000, life_stage="general", limit=50)
    res_punjab = matcher.match_profile(profile_punjab)
    delhi_in_punjab = [s for s in res_punjab.schemes if s.state.lower() == "delhi"]
    assert len(delhi_in_punjab) == 0
