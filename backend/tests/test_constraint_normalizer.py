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
    extract_age_bounds,
    extract_income_cap,
    extract_caste_categories,
    extract_residence_type,
    extract_boolean_flags,
    load_raw_data
)

# =============================================================================
# 1. Age Bounds Extraction Tests (Ticket 2.4)
# =============================================================================

@pytest.mark.parametrize("narrative,expected_min,expected_max", [
    ("Pregnant and lactating women aged 19 to 45 years.", 19, 45),
    ("Unmarried girls aged 13-19 years residing in West Bengal.", 13, 19),
    ("Resident women of Madhya Pradesh aged 21 to 60 years.", 21, 60),
    ("Permanent resident woman of Maharashtra aged 21 to 65 years.", 21, 65),
    ("Widow aged between 40 and 79 years living below the poverty line.", 40, 79),
    ("Group of 10 women aged 18-59 years residing in Gujarat.", 18, 59),
    ("SC, ST, BC, and Minority women aged between 45 and 60 years.", 45, 60),
    ("Women aged 16 years and above.", 16, 100),
    ("SC/ST and/or woman entrepreneur aged 18 years and above.", 18, 100),
    ("All women permanent residents aged 18 years and above.", 18, 100),
    ("Resident Indian girl child aged below 10 years at account opening.", 0, 10),
    ("Girl Child (up to 10 years of age)", 0, 10),
    ("Only girl child of family aged up to 30 years admitted into university.", 0, 30),
    ("Any resident Indian woman or girl. No upper age limit.", 0, 100),
])
def test_extract_age_bounds(narrative, expected_min, expected_max):
    min_age, max_age = extract_age_bounds(narrative)
    assert min_age == expected_min
    assert max_age == expected_max

# =============================================================================
# 2. Income Cap Extraction Tests (Ticket 2.4)
# =============================================================================

@pytest.mark.parametrize("narrative,expected_income", [
    ("Annual family income must not exceed Rs 3,00,000.", 300000),
    ("Annual family income under Rs 1,20,000 (waived for orphans).", 120000),
    ("Family annual income less than Rs 2,50,000. Non-taxpayer.", 250000),
    ("Annual family income must not exceed Rs 2,50,000.", 250000),
    ("Family annual income less than Rs 2,00,000.", 200000),
    ("Annual gross income of husband and wife together should not exceed Rs 3,00,000.", 300000),
    ("Annual family income below Rs 2.5 Lakh.", 250000),
    ("Gross monthly salary does not exceed Rs 50,000 in metro cities.", 600000),
    ("Universal entitlement with no income cap.", 0),
])
def test_extract_income_cap(narrative, expected_income):
    income = extract_income_cap(narrative)
    assert income == expected_income

# =============================================================================
# 3. Caste Categories Extraction Tests (Ticket 2.4)
# =============================================================================

def test_extract_caste_categories():
    assert "SC" in extract_caste_categories("Must belong to SC, ST, BPL, EWS")
    assert "ST" in extract_caste_categories("Must belong to SC, ST, BPL, EWS")
    
    assert "SC" in extract_caste_categories("SC/ST and/or woman entrepreneur")
    assert "ST" in extract_caste_categories("SC/ST and/or woman entrepreneur")

    categories = extract_caste_categories("SC, ST, BC, and Minority women")
    assert "SC" in categories
    assert "ST" in categories
    assert "OBC" in categories

    assert extract_caste_categories("All women and girls across all categories.") == ["All"]

# =============================================================================
# 4. Residence Type Extraction Tests (Ticket 2.4)
# =============================================================================

def test_extract_residence_type():
    assert extract_residence_type("Targeting rural women and artisans") == "Rural"
    assert extract_residence_type("Urban street vendors and hawkers") == "Urban"
    assert extract_residence_type("All resident citizens of the state") == "All"

# =============================================================================
# 5. Boolean Eligibility Flags Extraction Tests (Ticket 2.4)
# =============================================================================

def test_extract_boolean_flags():
    bpl_text = "Living below the poverty line (BPL) with Antyodaya yellow ration card."
    flags = extract_boolean_flags(bpl_text)
    assert flags["requires_bpl"] is True
    assert flags["requires_disability"] is False

    disability_text = "Hold disability certificate or verified Divyang status."
    flags = extract_boolean_flags(disability_text)
    assert flags["requires_disability"] is True

    universal_text = "Female students enrolled in government schools."
    flags = extract_boolean_flags(universal_text)
    assert flags["requires_bpl"] is False
    assert flags["requires_disability"] is False

# =============================================================================
# 6. End-to-End Extraction on Kaggle Dataset
# =============================================================================

def test_kaggle_dataset_extracted_constraints():
    raw_data = load_raw_data()
    schemes_by_id = {t["scheme_id"]: t for _, t in raw_data}

    # 1. PMMVY: age 19 to 45, BPL true
    pmmvy = schemes_by_id.get("pradhan-mantri-matru-vandana-yojana")
    assert pmmvy is not None
    assert pmmvy["age_min"] == 19
    assert pmmvy["age_max"] == 45
    assert pmmvy["requires_bpl"] is True

    # 2. SSY: age 0 to 10
    ssy = schemes_by_id.get("sukanya-samriddhi-yojana")
    assert ssy is not None
    assert ssy["age_min"] == 0
    assert ssy["age_max"] == 10

    # 3. Ladli Behna: age 21 to 60, income 250000
    ladli = schemes_by_id.get("mukhyamantri-ladli-behna-yojana")
    assert ladli is not None
    assert ladli["age_min"] == 21
    assert ladli["age_max"] == 60
    assert ladli["income_max"] == 250000

    # 4. Majhi Ladki: age 21 to 65, income 250000
    ladki = schemes_by_id.get("mukhyamantri-majhi-ladki-bahin-yojana")
    assert ladki is not None
    assert ladki["age_min"] == 21
    assert ladki["age_max"] == 65
    assert ladki["income_max"] == 250000

    # 5. IGNWPS: age 40 to 79, BPL true
    ignwps = schemes_by_id.get("indira-gandhi-national-widow-pension-scheme")
    assert ignwps is not None
    assert ignwps["age_min"] == 40
    assert ignwps["age_max"] == 79
    assert ignwps["requires_bpl"] is True
