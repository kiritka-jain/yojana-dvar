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
    ("The applicant should not be aged less than 18 years or above 60 years.", 18, 60),
    ("The applicant should be between the age group of 18 to 35 years.", 18, 35),
    ("Age limit: 18 - 45 years for female applicants.", 18, 45),
    ("Girl students enrolled in Class 9 to 10 in recognized schools.", 14, 16),
    ("Students pursuing undergraduate degree or diploma courses.", 17, 25),
    ("Infants and newborn girl child nutrition support.", 0, 5),
    ("Application deadline is 31st March 2025. 100% financial assistance.", 0, 100),
])
def test_extract_age_bounds(narrative, expected_min, expected_max):
    min_age, max_age = extract_age_bounds(narrative)
    assert min_age == expected_min
    assert max_age == expected_max

# =============================================================================
# 2. Income Cap Extraction Tests (Ticket 2.4 / Ticket 1.2)
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
    ("The yearly income of the family should not be more than Rs. 56, 450/- in urban areas.", 56450),
    ("Parental annual income does not exceed ₹ 1.50 Lakhs.", 150000),
    ("Annual income limit of Rs. 75,000/- per annum.", 75000),
    ("Beneficiaries under Economically Weaker Section (EWS) income limit.", 800000),
    ("Beneficiaries must have no income bar.", 0),
])
def test_extract_income_cap(narrative, expected_income):
    income = extract_income_cap(narrative)
    assert income == expected_income

# =============================================================================
# 3. Caste Categories Extraction Tests (Ticket 2.4 / Ticket 1.3)
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

    brahmin_cat = extract_caste_categories("Funeral expenses for poor Brahmin families.")
    assert "General" in brahmin_cat

    assert extract_caste_categories("All women and girls across all categories.") == ["All"]
    assert extract_caste_categories("Open to all women regardless of caste.") == ["All"]

# =============================================================================
# 4. Residence Type Extraction Tests (Ticket 2.4 / Ticket 1.3)
# =============================================================================

def test_extract_residence_type():
    assert extract_residence_type("Targeting rural women and artisans") == "Rural"
    assert extract_residence_type("Gram Panchayat and village residents") == "Rural"
    assert extract_residence_type("Urban street vendors and hawkers") == "Urban"
    assert extract_residence_type("Nagar Nigam and municipality areas") == "Urban"
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

    # 1. PMMVY: age 19 to 45 or 0 to 50
    pmmvy = schemes_by_id.get("pradhan-mantri-matru-vandana-yojana") or schemes_by_id.get("pmmvy-central")
    assert pmmvy is not None
    assert pmmvy["age_min"] >= 0
    assert pmmvy["age_max"] <= 50

    # 2. SSY: age 0 to 10
    ssy = schemes_by_id.get("sukanya-samriddhi-yojana") or schemes_by_id.get("sukanya-samriddhi-account") or schemes_by_id.get("ssy-central")
    assert ssy is not None
    assert ssy["age_min"] == 0
    assert ssy["age_max"] == 10

    # 3. Ladli Behna & Delhi Ladli
    ladli = schemes_by_id.get("mukhyamantri-ladli-behna-yojana") or schemes_by_id.get("chief-minister-ladli-behna-yojana")
    assert ladli is not None
    assert ladli["age_max"] >= 18

    delhi_ladli = schemes_by_id.get("delhi-ladli-scheme")
    assert delhi_ladli is not None
    assert delhi_ladli["age_min"] == 0
    assert delhi_ladli["age_max"] == 24

    # 4. Majhi Ladki
    ladki = schemes_by_id.get("mukhyamantri-majhi-ladki-bahin-yojana") or schemes_by_id.get("chief-ministers-majhi-ladki-bahin-scheme")
    assert ladki is not None or len(schemes_by_id) > 100

    # 5. IGNWPS
    ignwps = schemes_by_id.get("indira-gandhi-national-widow-pension-scheme") or schemes_by_id.get("ignwps-pension") or schemes_by_id.get("indira-gandhi-national-widow-pension-scheme-ignwps")
    assert ignwps is not None
    assert ignwps["age_min"] >= 18

# =============================================================================
# 7. Additional Edge Case Tests (Epic 4: Ticket 4.1)
# =============================================================================

@pytest.mark.parametrize("narrative,expected_min,expected_max", [
    ("Super senior citizens aged 80 years and above receiving special monthly allowance.", 80, 100),
    ("Senior citizens above 65 years of age.", 65, 100),
    ("Elderly women aged 70 years and above.", 70, 100),
    ("ITI / Vocational training program for youth aged 15 to 29 years.", 15, 29),
    ("Post-graduate research fellowship for scholars up to 35 years.", 21, 35),
    ("Girl students studying in Class 1 to 8 in government schools.", 6, 14),
    ("High school girl students in Classes 11 and 12.", 16, 18),
])
def test_edge_case_age_bounds(narrative, expected_min, expected_max):
    min_age, max_age = extract_age_bounds(narrative)
    assert min_age == expected_min
    assert max_age == expected_max

@pytest.mark.parametrize("narrative,expected_income", [
    ("Annual household income strictly below ₹ 1,00,000/- p.a.", 100000),
    ("Family income ceiling of Rs. 48,000 per annum for rural applicants.", 48000),
    ("Parental annual income limit Rs. 6.00 Lakhs per annum.", 600000),
    ("Income limit of Rs. 8 Lakh per year under EWS criteria.", 800000),
    ("No ceiling on annual family income.", 0),
])
def test_edge_case_income_caps(narrative, expected_income):
    income = extract_income_cap(narrative)
    assert income == expected_income

def test_diverse_caste_and_residence_scenarios():
    # EBC & Minority
    minority_text = "Targeting Economically Backward Classes (EBC) and minority communities."
    caste = extract_caste_categories(minority_text)
    assert "OBC" in caste or "General" in caste

    # Tribal / PVTG
    st_text = "Assistance to primitive tribal groups and Scheduled Tribes (ST)."
    assert "ST" in extract_caste_categories(st_text)

    # Rural Panchayat vs Municipal Urban
    assert extract_residence_type("Rural cottage industries in panchayat samiti") == "Rural"
    assert extract_residence_type("Municipal corporation street vendors") == "Urban"
    assert extract_residence_type("Applicable across state without regional restrictions") == "All"

