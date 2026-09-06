import sys
import os
import json
import pytest

# Ensure scripts directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../scripts")))

from etl_load_schemes import (
    merge_scheme_records,
    merge_and_deduplicate_schemes
)


def test_merge_identical_records():
    record = {
        "scheme_id": "pm-matru-vandana",
        "name": "Pradhan Mantri Matru Vandana Yojana",
        "description": "Maternity benefit cash transfer scheme.",
        "ministry": "Ministry of Women and Child Development",
        "department": "WCD",
        "state": "All",
        "category": "Maternity & Health",
        "beneficiary_type": "Pregnant & Lactating Mothers",
        "benefits": "Cash incentive of Rs 5,000 in direct bank transfer",
        "eligibility_text": "Pregnant women aged 19 and above",
        "documents_required": "Aadhaar, Bank Passbook, MCP Card",
        "application_process": "Apply via PMMVY portal",
        "apply_url": "https://pmmvy.wcd.gov.in",
        "official_url": "https://wcd.gov.in/pmmvy",
        "age_min": 19,
        "age_max": 45,
        "gender": "Female",
        "caste_categories": json.dumps(["All"]),
        "income_max": 800000,
        "residence": "All",
        "eligible_states": json.dumps(["All"]),
        "requires_bpl": True,
        "requires_disability": False,
        "life_stage_tags": json.dumps(["maternal"]),
        "is_active": True
    }
    merged = merge_scheme_records(record, record)
    assert merged["scheme_id"] == "pm-matru-vandana"
    assert merged["name"] == "Pradhan Mantri Matru Vandana Yojana"
    assert merged["age_min"] == 19
    assert merged["age_max"] == 45
    assert json.loads(merged["life_stage_tags"]) == ["maternal"]
    assert merged["requires_bpl"] is True


def test_merge_narrative_prefers_longer():
    existing = {
        "scheme_id": "sukanya-samriddhi",
        "name": "Sukanya Samriddhi Yojana",
        "description": "Savings scheme for girl child.",
        "eligibility_text": "Girl child below 10 years.",
        "benefits": "High interest rate.",
        "documents_required": "Birth certificate.",
        "application_process": "Visit post office."
    }
    incoming = {
        "scheme_id": "sukanya-samriddhi",
        "name": "Sukanya Samriddhi Yojana",
        "description": "A government-backed small deposit savings scheme targeted exclusively for the welfare and financial security of girl children.",
        "eligibility_text": "Girl child who is an Indian resident and aged below 10 years at account opening date.",
        "benefits": "Tax-exempt high interest compounding returns under Section 80C with sovereign guarantee.",
        "documents_required": "Birth certificate of the girl child, identity proof of legal guardian, MCP card, and address proof.",
        "application_process": "Submit application form at any authorized commercial bank or post office branch with initial deposit."
    }
    merged = merge_scheme_records(existing, incoming)
    assert merged["description"] == incoming["description"]
    assert merged["eligibility_text"] == incoming["eligibility_text"]
    assert merged["benefits"] == incoming["benefits"]
    assert merged["documents_required"] == incoming["documents_required"]
    assert merged["application_process"] == incoming["application_process"]


def test_merge_ministry_prefers_specific_over_generic():
    existing = {
        "scheme_id": "beti-bachao",
        "ministry": "Government of India",
        "department": "Department of Social Welfare",
        "category": "Social welfare & Empowerment",
        "beneficiary_type": "Women & Girls"
    }
    incoming = {
        "scheme_id": "beti-bachao",
        "ministry": "Ministry of Women and Child Development",
        "department": "Child Protection Bureau",
        "category": "Women & Child Care Welfare",
        "beneficiary_type": "Girl Children & Mothers"
    }
    merged = merge_scheme_records(existing, incoming)
    assert merged["ministry"] == "Ministry of Women and Child Development"
    assert merged["department"] == "Child Protection Bureau"
    assert merged["category"] == "Women & Child Care Welfare"
    assert merged["beneficiary_type"] == "Girl Children & Mothers"


def test_merge_urls_prefers_valid_https():
    existing = {
        "scheme_id": "stand-up-india",
        "apply_url": "",
        "official_url": "standupmitra portal"
    }
    incoming = {
        "scheme_id": "stand-up-india",
        "apply_url": "https://www.standupmitra.in/Home/Apply",
        "official_url": "https://www.standupmitra.in"
    }
    merged = merge_scheme_records(existing, incoming)
    assert merged["apply_url"] == "https://www.standupmitra.in/Home/Apply"
    assert merged["official_url"] == "https://www.standupmitra.in"


def test_merge_caste_categories_union():
    # Specific + Specific
    rec1 = {"scheme_id": "post-matric-sc", "caste_categories": json.dumps(["SC"])}
    rec2 = {"scheme_id": "post-matric-sc", "caste_categories": json.dumps(["ST"])}
    merged = merge_scheme_records(rec1, rec2)
    assert json.loads(merged["caste_categories"]) == ["SC", "ST"]

    # Specific + All
    rec3 = {"scheme_id": "post-matric-sc", "caste_categories": json.dumps(["All"])}
    rec4 = {"scheme_id": "post-matric-sc", "caste_categories": json.dumps(["SC", "ST"])}
    merged2 = merge_scheme_records(rec3, rec4)
    assert json.loads(merged2["caste_categories"]) == ["SC", "ST"]


def test_merge_life_stage_tags_union():
    rec1 = {"scheme_id": "maternal-student-aid", "life_stage_tags": json.dumps(["maternal"])}
    rec2 = {"scheme_id": "maternal-student-aid", "life_stage_tags": json.dumps(["student"])}
    merged = merge_scheme_records(rec1, rec2)
    assert json.loads(merged["life_stage_tags"]) == ["maternal", "student"]

    # Invalid tags filtered out, general fallback when empty
    rec3 = {"scheme_id": "test", "life_stage_tags": json.dumps(["unknown_tag"])}
    rec4 = {"scheme_id": "test", "life_stage_tags": json.dumps([])}
    merged3 = merge_scheme_records(rec3, rec4)
    assert json.loads(merged3["life_stage_tags"]) == ["general"]


def test_merge_age_bounds_tightest():
    # Min age: tighter is higher non-zero
    # Max age: tighter is lower non-default (100)
    rec1 = {"scheme_id": "schem-1", "age_min": 0, "age_max": 60}
    rec2 = {"scheme_id": "schem-1", "age_min": 18, "age_max": 100}
    merged = merge_scheme_records(rec1, rec2)
    assert merged["age_min"] == 18
    assert merged["age_max"] == 60

    # Both non-default
    rec3 = {"scheme_id": "schem-2", "age_min": 18, "age_max": 55}
    rec4 = {"scheme_id": "schem-2", "age_min": 21, "age_max": 50}
    merged2 = merge_scheme_records(rec3, rec4)
    assert merged2["age_min"] == 21
    assert merged2["age_max"] == 50


def test_merge_income_cap_tightest():
    # Tighter cap is lower positive income
    rec1 = {"scheme_id": "income-test", "income_max": 0}
    rec2 = {"scheme_id": "income-test", "income_max": 300000}
    merged = merge_scheme_records(rec1, rec2)
    assert merged["income_max"] == 300000

    rec3 = {"scheme_id": "income-test", "income_max": 500000}
    rec4 = {"scheme_id": "income-test", "income_max": 250000}
    merged2 = merge_scheme_records(rec3, rec4)
    assert merged2["income_max"] == 250000


def test_merge_boolean_flags_or():
    rec1 = {"scheme_id": "bpl-flag", "requires_bpl": False, "requires_disability": True}
    rec2 = {"scheme_id": "bpl-flag", "requires_bpl": True, "requires_disability": False}
    merged = merge_scheme_records(rec1, rec2)
    assert merged["requires_bpl"] is True
    assert merged["requires_disability"] is True


def test_merge_residence_specific_over_all():
    rec1 = {"scheme_id": "res-test", "residence": "All"}
    rec2 = {"scheme_id": "res-test", "residence": "Rural"}
    merged = merge_scheme_records(rec1, rec2)
    assert merged["residence"] == "Rural"


def test_merge_and_deduplicate_schemes_uniqueness():
    records = [
        {
            "scheme_id": "pm-matru-vandana",
            "name": "Pradhan Mantri Matru Vandana Yojana",
            "description": "Short description",
            "life_stage_tags": json.dumps(["maternal"]),
            "requires_bpl": False
        },
        {
            "scheme_id": "pm-matru-vandana",
            "name": "Pradhan Mantri Matru Vandana Yojana",
            "description": "Much longer comprehensive description of PMMVY maternity benefits.",
            "life_stage_tags": json.dumps(["general"]),
            "requires_bpl": True
        },
        {
            "scheme_id": "sukanya-samriddhi",
            "name": "Sukanya Samriddhi Yojana",
            "description": "Savings scheme for girls.",
            "life_stage_tags": json.dumps(["student"]),
            "requires_bpl": False
        }
    ]
    deduped = merge_and_deduplicate_schemes(records)
    assert len(deduped) == 2
    
    pmmvy = next(s for s in deduped if s["scheme_id"] == "pm-matru-vandana")
    assert pmmvy["description"] == "Much longer comprehensive description of PMMVY maternity benefits."
    assert pmmvy["requires_bpl"] is True
    assert set(json.loads(pmmvy["life_stage_tags"])) == {"maternal", "general"}
