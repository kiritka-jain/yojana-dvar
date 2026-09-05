import json
import os
import sys
import pytest

# Ensure scripts directory is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

from etl_load_schemes import (
    classify_life_stage,
    CANONICAL_LIFE_STAGES,
    load_raw_data
)

# =============================================================================
# 1. Maternal Life-Stage Classification Tests
# =============================================================================

@pytest.mark.parametrize("scheme_data", [
    {
        "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "category": "Social welfare & Empowerment",
        "beneficiary_type": "Pregnant Women and Lactating Mothers",
        "description": "Cash transfer scheme for pregnant women and lactating mothers for maternal health and nutrition.",
        "benefits": "Direct cash benefit of Rs 5,000 in installments for maternal delivery."
    },
    {
        "name": "Janani Suraksha Yojana (JSY)",
        "category": "Healthcare & Maternity",
        "beneficiary_type": "Pregnant Women",
        "description": "Safe motherhood intervention under National Health Mission promoting institutional delivery.",
        "benefits": "Cash assistance for hospital delivery and infant postnatal care."
    }
])
def test_classify_maternal_schemes(scheme_data):
    tags = classify_life_stage(scheme_data)
    assert "maternal" in tags
    assert all(t in CANONICAL_LIFE_STAGES for t in tags)

# =============================================================================
# 2. Student Life-Stage Classification Tests
# =============================================================================

@pytest.mark.parametrize("scheme_data", [
    {
        "name": "Sukanya Samriddhi Yojana (SSY)",
        "category": "Banking & Insurance",
        "beneficiary_type": "Girl Child (up to 10 years of age)",
        "description": "Small deposit savings scheme under Beti Bachao Beti Padhao for future higher education and marriage.",
        "benefits": "High interest rate savings for girl child education."
    },
    {
        "name": "Moovalur Ramamirtham Ammaiyar Pudhumai Penn Scheme",
        "category": "Education & Learning",
        "beneficiary_type": "Female Students from Government Schools",
        "description": "Higher education assurance scheme providing monthly stipends for female college enrollment.",
        "benefits": "Monthly financial aid of Rs 1,000 for undergraduate and diploma students."
    },
    {
        "name": "Post Graduate Indira Gandhi Scholarship for Single Girl Child",
        "category": "Education & Learning",
        "beneficiary_type": "Single Girl Children pursuing Post-Graduation",
        "description": "Financial scholarship to support single girl child in master's degree program.",
        "benefits": "Direct scholarship stipend of Rs 36,200 per annum for university studies."
    },
    {
        "name": "Kanyashree Prakalpa",
        "category": "Social welfare & Education",
        "beneficiary_type": "Adolescent Girls and Students in West Bengal",
        "description": "Incentivize female schooling and prevent child marriage.",
        "benefits": "Annual scholarship K1 for school enrollment and one-time grant K2 at age 18."
    },
    {
        "name": "Mukhyamantri Kanya Utthan Yojana",
        "category": "Education & Learning",
        "beneficiary_type": "Girl Children and College Graduates in Bihar",
        "description": "Financial incentive supporting girls through intermediate and university graduation.",
        "benefits": "Graduation incentive of Rs 50,000 for female college graduates."
    }
])
def test_classify_student_schemes(scheme_data):
    tags = classify_life_stage(scheme_data)
    assert "student" in tags
    assert all(t in CANONICAL_LIFE_STAGES for t in tags)

# =============================================================================
# 3. Entrepreneur Life-Stage Classification Tests
# =============================================================================

@pytest.mark.parametrize("scheme_data", [
    {
        "name": "Stand-Up India Scheme for Women Entrepreneurs",
        "category": "Business & Entrepreneurship",
        "beneficiary_type": "SC/ST and Women Entrepreneurs",
        "description": "Bank loans between Rs 10 Lakh and Rs 1 Crore for greenfield enterprise manufacturing or trading.",
        "benefits": "Working capital composite loan and credit support for women entrepreneurs."
    },
    {
        "name": "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
        "category": "Business & Entrepreneurship",
        "beneficiary_type": "Urban Street Vendors, Hawkers, Women Micro-Sellers",
        "description": "Collateral-free micro-credit working capital loan facility for street vendors.",
        "benefits": "Affordable micro loan of Rs 10,000 to Rs 50,000 for small business vending."
    },
    {
        "name": "Mission Shakti - Odisha",
        "category": "Business & Entrepreneurship",
        "beneficiary_type": "Self Help Group (SHG) Women in Odisha",
        "description": "Empowers women's Self Help Groups into micro-enterprises through interest-free bank loans.",
        "benefits": "0% interest business loans up to Rs 5 Lakh."
    },
    {
        "name": "Kudumbashree Women Empowerment & Livelihood Mission",
        "category": "Skills & Employment",
        "beneficiary_type": "Women in Kerala, Neighborhood Groups (NHG)",
        "description": "Community-based self-help groups for micro-enterprises, collective farming, and livelihood creation.",
        "benefits": "Micro-credit loans and skill training for women-led enterprises."
    },
    {
        "name": "Support to Training and Employment Programme for Women (STEP)",
        "category": "Skills & Employment",
        "beneficiary_type": "Women and Artisans",
        "description": "Vocational skills training to enable sustainable self-employment and micro-entrepreneurship.",
        "benefits": "Modular training across traditional handlooms, food processing, and craft sectors."
    }
])
def test_classify_entrepreneur_schemes(scheme_data):
    tags = classify_life_stage(scheme_data)
    assert "entrepreneur" in tags
    assert all(t in CANONICAL_LIFE_STAGES for t in tags)

# =============================================================================
# 4. Senior & Widow Life-Stage Classification Tests
# =============================================================================

@pytest.mark.parametrize("scheme_data", [
    {
        "name": "Indira Gandhi National Widow Pension Scheme (IGNWPS)",
        "category": "Social welfare & Empowerment",
        "beneficiary_type": "Widows from BPL households",
        "description": "Monthly social security pension financial assistance to poor widows aged 40-79 years.",
        "benefits": "Monthly direct bank transfer pension of Rs 300 to Rs 2,500."
    },
    {
        "name": "State Old Age & Destitute Widow Security Pension",
        "category": "Social Security",
        "beneficiary_type": "Elderly senior citizens and widows aged above 60",
        "description": "Social assistance pension for elderly vulnerable women.",
        "benefits": "Monthly pension for senior citizens."
    }
])
def test_classify_senior_schemes(scheme_data):
    tags = classify_life_stage(scheme_data)
    assert "senior" in tags
    assert all(t in CANONICAL_LIFE_STAGES for t in tags)

# =============================================================================
# 5. General Welfare Life-Stage Classification Tests
# =============================================================================

@pytest.mark.parametrize("scheme_data", [
    {
        "name": "Pradhan Mantri Ujjwala Yojana (PMUY 2.0)",
        "category": "Social welfare & Energy",
        "beneficiary_type": "Women from Low-Income / BPL Households",
        "description": "Deposit-free LPG gas connections and refill subsidies for poor households.",
        "benefits": "Free LPG connection, stove, and targeted gas subsidy."
    },
    {
        "name": "Gruha Lakshmi Scheme",
        "category": "Social welfare & Basic Income",
        "beneficiary_type": "Female Heads of Households in Karnataka",
        "description": "Universal basic income initiative for women heads of families.",
        "benefits": "Monthly financial aid of Rs 2,000 to woman family head."
    },
    {
        "name": "Mukhyamantri Ladli Behna Yojana",
        "category": "Social welfare & Empowerment",
        "beneficiary_type": "Adult Women in Madhya Pradesh",
        "description": "Monthly cash assistance for economic independence and nutrition.",
        "benefits": "Direct monthly cash benefit of Rs 1,250 into bank account."
    },
    {
        "name": "Mahalakshmi Scheme (Free Bus Travel)",
        "category": "Travel & Transportation",
        "beneficiary_type": "All Girls and Women in Telangana",
        "description": "Zero-fare public bus transportation across state RTC buses.",
        "benefits": "Free travel in express and city buses."
    }
])
def test_classify_general_schemes(scheme_data):
    tags = classify_life_stage(scheme_data)
    assert "general" in tags
    assert all(t in CANONICAL_LIFE_STAGES for t in tags)

# =============================================================================
# 6. Fallback and Edge Cases
# =============================================================================

def test_classify_empty_and_fallback():
    assert classify_life_stage({}) == ["general"]
    assert classify_life_stage(None) == ["general"]
    assert classify_life_stage({"name": "Uncategorized Social Mission"}) == ["general"]

# =============================================================================
# 7. Dataset-Wide Life-Stage Validation
# =============================================================================

def test_all_raw_and_transformed_records_have_valid_life_stage():
    raw_data = load_raw_data()
    assert len(raw_data) >= 30

    for _, trans in raw_data:
        tags_raw = trans.get("life_stage_tags")
        assert tags_raw is not None
        tags = json.loads(tags_raw)
        assert isinstance(tags, list)
        assert len(tags) >= 1
        for t in tags:
            assert t in CANONICAL_LIFE_STAGES
