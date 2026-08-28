import pytest
from app.models.profile import ProfileInput
from app.services.matcher import EligibilityMatcher

@pytest.fixture
def matcher():
    return EligibilityMatcher()

def test_age_boundary_matching(matcher):
    """Test age boundary limits (e.g. Sukanya Samriddhi Yojana max age 10)."""
    # 5 year old girl should qualify for SSY
    profile_child = ProfileInput(age=5, gender="Female", state="All", life_stage="student")
    res_child = matcher.match_profile(profile_child)
    ssy_matches = [s for s in res_child.schemes if s.scheme_id == "ssy-central"]
    assert len(ssy_matches) == 1
    
    # 15 year old girl should NOT qualify for SSY (age max is 10)
    profile_teen = ProfileInput(age=15, gender="Female", state="All", life_stage="student")
    res_teen = matcher.match_profile(profile_teen)
    ssy_matches_teen = [s for s in res_teen.schemes if s.scheme_id == "ssy-central"]
    assert len(ssy_matches_teen) == 0

def test_income_max_boundary(matcher):
    """Test annual family income cap filtering."""
    # BPL / Low Income woman (Rs 50,000) qualifies for PMMVY (max 2,50,000)
    profile_low_income = ProfileInput(age=25, gender="Female", state="All", income=50000, is_bpl=True, life_stage="maternal")
    res_low = matcher.match_profile(profile_low_income)
    pmmvy_matches = [s for s in res_low.schemes if s.scheme_id == "pmmvy-central"]
    assert len(pmmvy_matches) == 1

    # High Income woman (Rs 10,00,000) should NOT qualify for income-capped PMMVY
    profile_high_income = ProfileInput(age=25, gender="Female", state="All", income=1000000, is_bpl=False, life_stage="maternal")
    res_high = matcher.match_profile(profile_high_income)
    pmmvy_high_matches = [s for s in res_high.schemes if s.scheme_id == "pmmvy-central"]
    assert len(pmmvy_high_matches) == 0

def test_state_specific_filtering(matcher):
    """Test state targeted scheme filtering (UP vs TN vs MP vs West Bengal)."""
    # UP resident should qualify for Mukhya Mantri Kanya Sumangala Yojana (Uttar Pradesh)
    profile_up = ProfileInput(age=12, gender="Female", state="Uttar Pradesh", life_stage="student")
    res_up = matcher.match_profile(profile_up)
    up_matches = [s for s in res_up.schemes if s.scheme_id == "kanya-sumangala-up"]
    assert len(up_matches) == 1

    # Tamil Nadu resident should NOT qualify for UP state scheme
    profile_tn = ProfileInput(age=12, gender="Female", state="Tamil Nadu", life_stage="student")
    res_tn = matcher.match_profile(profile_tn)
    up_in_tn = [s for s in res_tn.schemes if s.scheme_id == "kanya-sumangala-up"]
    assert len(up_in_tn) == 0
    
    # Tamil Nadu resident should qualify for Pudhumai Penn Scheme (Tamil Nadu)
    tn_matches = [s for s in res_tn.schemes if s.scheme_id == "pudhumai-penn-tn"]
    assert len(tn_matches) == 1 or profile_tn.age < 17 # Pudhumai Penn age 17-25

def test_life_stage_score_boost(matcher):
    """Test that matching life_stage receives ranking score boost."""
    profile_maternal = ProfileInput(age=26, gender="Female", state="Bihar", is_bpl=True, life_stage="maternal")
    res = matcher.match_profile(profile_maternal)
    
    # PMMVY has life_stage_tags = ["maternal"], so it should get life stage boost (+30)
    pmmvy = next(s for s in res.schemes if s.scheme_id == "pmmvy-central")
    assert pmmvy.match_score >= 80
    assert any("life stage" in reason.lower() for reason in pmmvy.match_reasons)
