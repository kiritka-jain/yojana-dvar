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
    slugify,
    is_women_relevant,
    transform_kaggle_myscheme_record,
    load_raw_data,
    clean_int,
    clean_bool
)

# =============================================================================
# 1. Slugify & Helper Unit Tests
# =============================================================================

def test_slugify_standard_and_complex_names():
    assert slugify("Pradhan Mantri Matru Vandana Yojana (PMMVY)") == "pradhan-mantri-matru-vandana-yojana"
    assert slugify("Sukanya Samriddhi Yojana (SSY)") == "sukanya-samriddhi-yojana"
    assert slugify("PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)") == "pm-street-vendors-atmanirbhar-nidhi"
    assert slugify("Gruha Lakshmi Scheme - 2026!") == "gruha-lakshmi-scheme-2026"
    assert slugify("") == "unknown-scheme"
    assert slugify("   --- Special  Case ---   ") == "special-case"


def test_clean_int_and_bool():
    assert clean_int("1,500", 0) == 1500
    assert clean_int(25) == 25
    assert clean_int("invalid", 10) == 10
    assert clean_int(None, 0) == 0

    assert clean_bool("True") is True
    assert clean_bool("yes") is True
    assert clean_bool("1") is True
    assert clean_bool(True) is True
    assert clean_bool("false") is False
    assert clean_bool("0") is False
    assert clean_bool(None, False) is False

# =============================================================================
# 2. Kaggle MyScheme Record Transformation Tests (Ticket 2.1)
# =============================================================================

def test_transform_kaggle_myscheme_record_central():
    row = {
        "Scheme Name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "Ministry": "Ministry of Women and Child Development",
        "Department": "Department of Women and Child Development",
        "State": "Central",
        "Category": "Social welfare & Empowerment",
        "Beneficiaries": "Pregnant Women and Lactating Mothers",
        "Details": "Direct financial support to pregnant women.",
        "Benefits": "Direct cash benefit of Rs 5,000.",
        "Eligibility": "Pregnant and lactating women aged 19 to 45 years.",
        "Application Process": "Register online via the PMMVY Citizen Portal.",
        "Documents Required": "Aadhaar Card, MCP Card.",
        "Source URL": "https://pmmvy.wcd.gov.in/"
    }

    result = transform_kaggle_myscheme_record(row)

    assert result["scheme_id"] == "pradhan-mantri-matru-vandana-yojana"
    assert result["name"] == "Pradhan Mantri Matru Vandana Yojana (PMMVY)"
    assert result["description"] == "Direct financial support to pregnant women."
    assert result["ministry"] == "Ministry of Women and Child Development"
    assert result["department"] == "Department of Women and Child Development"
    assert result["state"] == "All"
    assert json.loads(result["eligible_states"]) == ["All"]
    assert result["category"] == "Social welfare & Empowerment"
    assert result["beneficiary_type"] == "Pregnant Women and Lactating Mothers"
    assert result["benefits"] == "Direct cash benefit of Rs 5,000."
    assert result["eligibility_text"] == "Pregnant and lactating women aged 19 to 45 years."
    assert result["documents_required"] == "Aadhaar Card, MCP Card."
    assert result["application_process"] == "Register online via the PMMVY Citizen Portal."
    assert result["apply_url"] == "https://pmmvy.wcd.gov.in/"
    assert result["official_url"] == "https://pmmvy.wcd.gov.in/"
    assert result["gender"] == "Female"
    assert result["is_active"] is True
    assert "updated_at" in result


def test_transform_kaggle_myscheme_record_state_specific():
    row = {
        "Scheme Name": "Mukhyamantri Majhi Ladki Bahin Yojana",
        "Ministry": "",
        "Department": "Department of Women and Child Development Maharashtra",
        "State": "Maharashtra",
        "Category": "Social welfare & Empowerment",
        "Beneficiaries": "Women in Maharashtra aged 21-65 years",
        "Details": "Maharashtra state social assistance program providing direct monthly financial support.",
        "Benefits": "Direct monthly cash transfer of Rs 1,500.",
        "Eligibility": "Permanent resident woman of Maharashtra aged 21 to 65 years.",
        "Application Process": "Apply online via Nari Shakti Doot App.",
        "Documents Required": "Aadhaar Card, Domicile Card.",
        "Source URL": "https://ladakibahin.maharashtra.gov.in/"
    }

    result = transform_kaggle_myscheme_record(row)

    assert result["scheme_id"] == "mukhyamantri-majhi-ladki-bahin-yojana"
    assert result["state"] == "Maharashtra"
    assert json.loads(result["eligible_states"]) == ["Maharashtra"]
    assert result["ministry"] == "Government of Maharashtra"
    assert result["department"] == "Department of Women and Child Development Maharashtra"


def test_transform_kaggle_myscheme_record_snake_case_fallback():
    row = {
        "scheme_name": "Kanyashree Prakalpa",
        "ministry_name": "Government of West Bengal",
        "department_name": "Department of Women & Child Development WB",
        "state_name": "West Bengal",
        "scheme_category": "Education & Empowerment",
        "target_beneficiary": "Adolescent Girls",
        "summary": "Incentivize schooling and prevent child marriage.",
        "scheme_benefits": "Annual scholarship K1 Rs 1,000, K2 Rs 25,000.",
        "eligibility_criteria_text": "Unmarried girls aged 13-19 years in West Bengal.",
        "required_documents": "Age Proof, Enrolment Certificate.",
        "application_url": "https://wbkanyashree.gov.in/"
    }

    result = transform_kaggle_myscheme_record(row)

    assert result["scheme_id"] == "kanyashree-prakalpa"
    assert result["name"] == "Kanyashree Prakalpa"
    assert result["description"] == "Incentivize schooling and prevent child marriage."
    assert result["state"] == "West Bengal"
    assert result["apply_url"] == "https://wbkanyashree.gov.in/"
    assert result["benefits"] == "Annual scholarship K1 Rs 1,000, K2 Rs 25,000."


def test_transform_kaggle_myscheme_record_fallback_empty_fields():
    row = {
        "Scheme Name": "Unknown Initiative",
        "State": "All India"
    }

    result = transform_kaggle_myscheme_record(row)

    assert result["scheme_id"] == "unknown-initiative"
    assert result["name"] == "Unknown Initiative"
    assert result["state"] == "All"
    assert result["ministry"] == "Government of India"
    assert result["department"] == "Department of Social Welfare"
    assert result["category"] == "Social welfare & Empowerment"
    assert result["beneficiary_type"] == "Women & Girls"
    assert result["apply_url"] == ""

# =============================================================================
# 3. Women Relevancy Filter Integration with Kaggle Fields
# =============================================================================

def test_is_women_relevant_on_kaggle_rows():
    kaggle_row = {
        "Scheme Name": "Sukanya Samriddhi Yojana",
        "Beneficiaries": "Girl Child (up to 10 years of age)",
        "Category": "Banking & Insurance",
        "Details": "Small deposit savings scheme for girl children.",
        "Eligibility": "Resident Indian girl child."
    }
    assert is_women_relevant(kaggle_row) is True

    male_exclusive_row = {
        "Scheme Name": "Men Veteran Pension",
        "Beneficiaries": "Retired male soldiers",
        "Category": "Defense Welfare",
        "Details": "Pension support for ex-servicemen.",
        "Eligibility": "Male military veterans."
    }
    assert is_women_relevant(male_exclusive_row) is False

# =============================================================================
# 4. File-level Kaggle Dataset Integration Tests
# =============================================================================

def test_raw_kaggle_csv_integration():
    raw_data = load_raw_data()
    assert len(raw_data) >= 30, f"Expected at least 30 records, got {len(raw_data)}"

    # Check that at least 30 Kaggle records are present and validated
    kaggle_schemes = [t for r, t in raw_data if "pmmvy" in t["apply_url"] or "ladki" in t["scheme_id"] or "kanya" in t["scheme_id"]]
    assert len(kaggle_schemes) > 0

    for _, scheme in raw_data:
        assert scheme["scheme_id"]
        assert scheme["name"]
        assert scheme["state"]
        assert scheme["gender"]
        assert json.loads(scheme["eligible_states"])
        assert json.loads(scheme["caste_categories"])
        assert json.loads(scheme["life_stage_tags"])
