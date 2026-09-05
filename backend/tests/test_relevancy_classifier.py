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
    classify_women_relevancy,
    is_women_relevant,
    load_raw_data
)

# =============================================================================
# 1. Explicit Gender Indicator Tests
# =============================================================================

def test_classify_explicit_female_gender():
    rec = {
        "name": "General Healthcare Scheme",
        "gender": "Female",
        "description": "Healthcare coverage program."
    }
    result = classify_women_relevancy(rec)
    assert result["is_relevant"] is True
    assert result["confidence_score"] >= 0.50
    assert any("gender" in r.lower() for r in result["reasons"])


def test_classify_beneficiary_gender_phrases():
    rec1 = {
        "name": "Nutrition Assistance",
        "Beneficiaries": "Pregnant Women and Lactating Mothers",
        "category": "Health"
    }
    res1 = classify_women_relevancy(rec1)
    assert res1["is_relevant"] is True
    assert "pregnant" in res1["matched_keywords"] or "women" in res1["matched_keywords"]

    rec2 = {
        "name": "Shelter Assistance",
        "Beneficiaries": "Distressed Widows and Destitute Women",
        "category": "Social welfare"
    }
    res2 = classify_women_relevancy(rec2)
    assert res2["is_relevant"] is True
    assert "widows" in res2["matched_keywords"] or "widow" in res2["matched_keywords"]

# =============================================================================
# 2. Transliterated and Regional Keyword Tests
# =============================================================================

@pytest.mark.parametrize("scheme_title,expected_keyword", [
    ("Mukhyamantri Ladli Behna Yojana", "ladli"),
    ("Mukhya Mantri Kanya Sumangala Yojana", "kanya"),
    ("Sukanya Samriddhi Yojana", "sukanya"),
    ("Mukhyamantri Mahila Samman Yojana", "mahila"),
    ("Pudhumai Penn Scheme", "penn"),
    ("Kudumbashree Livelihood Mission", "kudumbashree"),
    ("YSR Cheyutha Scheme", "cheyutha"),
    ("Orunodoi 2.0 Direct Benefit Transfer", "orunodoi"),
    ("Sakhi Niwas Working Women Hostel", "sakhi"),
    ("Indira Gandhi National Widow Pension Scheme", "widow"),
    ("Mukhyamantri Majhi Ladki Bahin Yojana", "ladki"),
    ("Pradhan Mantri Matru Vandana Yojana", "matru"),
    ("Beti Bachao Beti Padhao", "beti"),
])
def test_classify_regional_and_transliterated_keywords(scheme_title, expected_keyword):
    rec = {
        "name": scheme_title,
        "description": "State welfare initiative."
    }
    res = classify_women_relevancy(rec)
    assert res["is_relevant"] is True
    assert expected_keyword in res["matched_keywords"] or any(expected_keyword in kw for kw in res["matched_keywords"])

# =============================================================================
# 3. Devanagari Hindi Script Keyword Tests
# =============================================================================

@pytest.mark.parametrize("devanagari_title,expected_keyword", [
    ("मुख्यमंत्री महिला समृद्धि योजना", "महिला"),
    ("प्रधानमंत्री मातृ वंदना योजना", "मातृ"),
    ("सुकन्या समृद्धि खाता योजना", "सुकन्या"),
    ("कन्या सुमंगला योजना", "कन्या"),
    ("लाडली बहना योजना", "लाडली"),
    ("नारी शक्ति सम्मान योजना", "नारी"),
    ("बालिका समृद्धि योजना", "बालिका"),
    ("विधवा पेंशन योजना", "विधवा"),
    ("सखी केंद्र सहायता योजना", "सखी"),
])
def test_classify_devanagari_keywords(devanagari_title, expected_keyword):
    rec = {
        "name": devanagari_title,
        "description": "सरकारी कल्याणकारी योजना"
    }
    res = classify_women_relevancy(rec)
    assert res["is_relevant"] is True
    assert expected_keyword in res["matched_keywords"]

# =============================================================================
# 4. Male-Exclusive Negative Filtering Tests
# =============================================================================

def test_classify_negative_male_exclusion():
    male_rec = {
        "name": "Boys Only Boarding School Grant",
        "beneficiary_type": "Boys and young men only",
        "description": "Special technical training program exclusively for boys only.",
        "eligibility_text": "Candidates must be male applicants only."
    }
    res = classify_women_relevancy(male_rec)
    assert res["is_relevant"] is False
    assert res["is_male_exclusive"] is True
    assert is_women_relevant(male_rec) is False


def test_classify_male_pattern_with_widow_exception():
    # If a scheme mentions soldiers/men but explicitly includes widows/wives, keep it
    coed_rec = {
        "name": "Ex-Servicemen and Widows Financial Support Scheme",
        "beneficiary_type": "Retired defense personnel and their widows",
        "description": "Support for ex-servicemen men only when serving, but pensions extend to surviving widows and female dependents.",
        "eligibility_text": "Eligible widow of deceased defense service personnel."
    }
    res = classify_women_relevancy(coed_rec)
    assert res["is_relevant"] is True
    assert "widow" in res["matched_keywords"] or "widows" in res["matched_keywords"]

# =============================================================================
# 5. Ministry Administrative Boost Tests
# =============================================================================

def test_classify_ministry_boost():
    rec = {
        "name": "SAMBAL Support Initiative",
        "ministry": "Ministry of Women and Child Development",
        "department": "Department of Women Empowerment",
        "description": "Comprehensive safety and empowerment scheme."
    }
    res = classify_women_relevancy(rec)
    assert res["is_relevant"] is True
    assert any("Ministry" in r for r in res["reasons"])

# =============================================================================
# 6. Edge Cases & Null Record Handling
# =============================================================================

def test_classify_empty_and_irrelevant_records():
    assert classify_women_relevancy({})["is_relevant"] is False
    assert classify_women_relevancy(None)["is_relevant"] is False

    generic_rec = {
        "name": "National Highway Paving Contract Grant",
        "ministry": "Ministry of Road Transport and Highways",
        "category": "Infrastructure",
        "description": "Commercial road paving subsidies for civil contractors."
    }
    assert classify_women_relevancy(generic_rec)["is_relevant"] is False
    assert is_women_relevant(generic_rec) is False

# =============================================================================
# 7. Zero False Exclusions on Kaggle Dataset
# =============================================================================

def test_zero_false_exclusions_on_kaggle_myscheme_csv():
    raw_data = load_raw_data()
    assert len(raw_data) >= 30

    for raw_row, trans_row in raw_data:
        raw_eval = classify_women_relevancy(raw_row)
        trans_eval = classify_women_relevancy(trans_row)
        
        is_rel = raw_eval["is_relevant"] or trans_eval["is_relevant"]
        assert is_rel is True, f"False exclusion detected for scheme: {trans_row.get('name')}"
        assert (raw_eval["confidence_score"] > 0 or trans_eval["confidence_score"] > 0)
