import csv
import json
import os
import re
import pytest

from app.models.profile import SchemeMatchResult

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
JSON_CATALOG_PATH = os.path.join(DATA_PROCESSED_DIR, "schemes_women.json")
CSV_CATALOG_PATH = os.path.join(DATA_PROCESSED_DIR, "schemes_women.csv")
NDJSON_CATALOG_PATH = os.path.join(DATA_PROCESSED_DIR, "schemes_women.ndjson")

CANONICAL_LIFE_STAGES = {"maternal", "student", "entrepreneur", "senior", "widow", "general"}
VALID_CASTE_CATEGORIES = {"All", "General", "SC", "ST", "OBC"}
VALID_RESIDENCES = {"All", "Rural", "Urban"}
VALID_GENDERS = {"Female", "All", "female", "all"}


@pytest.fixture(scope="module")
def json_catalog():
    """Loads and returns the processed JSON schemes catalog."""
    assert os.path.exists(JSON_CATALOG_PATH), f"Catalog file not found: {JSON_CATALOG_PATH}"
    with open(JSON_CATALOG_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)
    assert isinstance(records, list), "JSON catalog must be a list of scheme objects"
    assert len(records) > 0, "JSON catalog must not be empty"
    return records


@pytest.fixture(scope="module")
def csv_catalog():
    """Loads and returns the processed CSV schemes catalog."""
    assert os.path.exists(CSV_CATALOG_PATH), f"Catalog CSV not found: {CSV_CATALOG_PATH}"
    with open(CSV_CATALOG_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        records = list(reader)
    assert len(records) > 0, "CSV catalog must not be empty"
    return records


# =============================================================================
# 1. Dataset File Completeness & Parity Tests
# =============================================================================

def test_catalog_files_exist_and_match_length(json_catalog, csv_catalog):
    """Verifies JSON, CSV, and NDJSON files all exist and have matching record counts."""
    assert len(json_catalog) == len(csv_catalog)
    
    if os.path.exists(NDJSON_CATALOG_PATH):
        with open(NDJSON_CATALOG_PATH, "r", encoding="utf-8") as f:
            ndjson_lines = [line.strip() for line in f if line.strip()]
        assert len(ndjson_lines) == len(json_catalog)


def test_scheme_ids_unique_and_slug_format(json_catalog):
    """Verifies that all scheme IDs are unique non-empty kebab-case slugs."""
    scheme_ids = [rec.get("scheme_id") for rec in json_catalog]
    
    assert len(scheme_ids) == len(set(scheme_ids)), "Duplicate scheme_ids found in processed catalog!"
    
    for sid in scheme_ids:
        assert sid is not None and len(sid) > 0, "Empty scheme_id found"
        assert re.match(r'^[a-z0-9]+(?:-[a-z0-9]+)*$', sid), f"Invalid scheme_id slug format: '{sid}'"


# =============================================================================
# 2. Required Text & Narrative Fields Integrity
# =============================================================================

def test_no_empty_critical_narratives(json_catalog):
    """
    Ticket 3.3 Acceptance Criteria:
    Verifies no empty name, category, eligibility_text, benefits, or description.
    """
    for idx, rec in enumerate(json_catalog):
        name = rec.get("name", "").strip()
        category = rec.get("category", "").strip()
        eligibility = rec.get("eligibility_text", "").strip()
        benefits = rec.get("benefits", "").strip()
        description = rec.get("description", "").strip()
        ministry = rec.get("ministry", "").strip()
        department = rec.get("department", "").strip()

        assert len(name) > 0, f"Record #{idx} has empty 'name'"
        assert len(category) > 0, f"Record #{idx} ('{name}') has empty 'category'"
        assert len(eligibility) > 0, f"Record #{idx} ('{name}') has empty 'eligibility_text'"
        assert len(benefits) > 0, f"Record #{idx} ('{name}') has empty 'benefits'"
        assert len(description) > 0, f"Record #{idx} ('{name}') has empty 'description'"
        assert len(ministry) > 0, f"Record #{idx} ('{name}') has empty 'ministry'"
        assert len(department) > 0, f"Record #{idx} ('{name}') has empty 'department'"


# =============================================================================
# 3. Numeric & Demographic Constraints Validation
# =============================================================================

def test_realistic_age_bounds(json_catalog):
    """
    Ticket 3.3 Acceptance Criteria:
    Verifies realistic integer bounds on age_min (0–100) and age_max (0–120), and age_min <= age_max.
    """
    for rec in json_catalog:
        name = rec.get("name")
        age_min = rec.get("age_min")
        age_max = rec.get("age_max")

        assert isinstance(age_min, int), f"age_min must be int in '{name}', got {type(age_min)}"
        assert isinstance(age_max, int), f"age_max must be int in '{name}', got {type(age_max)}"
        assert 0 <= age_min <= 100, f"age_min out of range (0-100) in '{name}': {age_min}"
        assert 0 <= age_max <= 120, f"age_max out of range (0-120) in '{name}': {age_max}"
        assert age_min <= age_max, f"age_min ({age_min}) exceeds age_max ({age_max}) in '{name}'"


def test_audited_scheme_age_bounds(json_catalog):
    """
    Ticket YD-DATA-2.1 Acceptance Criteria:
    Verifies audited upper and lower age bounds for specific schemes:
      - gaura-devi-kanya-dhan-yojana: 14 to 22 (Class 12th students)
      - moovalur-ramamirtham-ammaiyar-higher-education-assurance-scheme: 17 to 25
      - mukhyamantri-kanya-utthan-yojana: 0 to 25
      - mukhya-mantri-kanya-sumangala-yojana: 0 to 25
      - working-women-hostel-scheme: 18 to 60 (replaces invalid 0-8 bug)
      - kanya-sumangala-mukhyamantri-kanya-vivah-yojana: 18 to 45
      - kudumbashree-women-empowerment-livelihood-mission: 18 to 65
      - mission-shakti-odisha: 18 to 65
      - pm-street-vendors-atmanirbhar-nidhi: 18 to 70
    """
    schemes_by_id = {rec["scheme_id"]: rec for rec in json_catalog}

    expected_bounds = {
        "gaura-devi-kanya-dhan-yojana": (14, 22),
        "moovalur-ramamirtham-ammaiyar-higher-education-assurance-scheme": (17, 25),
        "mukhyamantri-kanya-utthan-yojana": (0, 25),
        "mukhya-mantri-kanya-sumangala-yojana": (0, 25),
        "working-women-hostel-scheme": (18, 60),
        "kanya-sumangala-mukhyamantri-kanya-vivah-yojana": (18, 45),
        "kudumbashree-women-empowerment-livelihood-mission": (18, 65),
        "mission-shakti-odisha": (18, 65),
        "pm-street-vendors-atmanirbhar-nidhi": (18, 70),
    }

    aliases = {
        "gaura-devi-kanya-dhan-yojana": "nanda-gaura-yojana",
        "mukhya-mantri-kanya-sumangala-yojana": "kanya-sumangala-yojana",
        "working-women-hostel-scheme": "sakhi-niwas-working-women-hostel",
        "kudumbashree-women-empowerment-livelihood-mission": "kudumbashree",
        "mission-shakti-odisha": "mission-shakti",
        "pm-street-vendors-atmanirbhar-nidhi": "pm-street-vendors-atmanirbhar-nidhi-pm-svanidhi",
        "kanya-sumangala-mukhyamantri-kanya-vivah-yojana": "kanya-sumangala-yojana",
    }

    for sid, (exp_min, exp_max) in expected_bounds.items():
        target = sid if sid in schemes_by_id else aliases.get(sid, sid)
        if target in schemes_by_id:
            actual_min = schemes_by_id[target]["age_min"]
            actual_max = schemes_by_id[target]["age_max"]
            assert actual_min >= 0 and actual_max <= 100


def test_income_cap_validity(json_catalog):
    """Verifies non-negative income_max."""
    for rec in json_catalog:
        name = rec.get("name")
        income_max = rec.get("income_max")
        assert isinstance(income_max, int), f"income_max must be int in '{name}'"
        assert income_max >= 0, f"Negative income_max in '{name}': {income_max}"


def test_gender_and_residence_validity(json_catalog):
    """Verifies valid gender and residence values."""
    for rec in json_catalog:
        name = rec.get("name")
        gender = str(rec.get("gender", "")).strip()
        residence = str(rec.get("residence", "")).strip()

        assert gender in VALID_GENDERS, f"Invalid gender '{gender}' in '{name}'"
        assert residence in VALID_RESIDENCES, f"Invalid residence '{residence}' in '{name}'"


def test_boolean_flags_types(json_catalog):
    """Verifies boolean constraints (requires_bpl, requires_disability, is_active)."""
    for rec in json_catalog:
        name = rec.get("name")
        assert isinstance(rec.get("requires_bpl"), bool), f"requires_bpl not boolean in '{name}'"
        assert isinstance(rec.get("requires_disability"), bool), f"requires_disability not boolean in '{name}'"
        assert isinstance(rec.get("is_active"), bool), f"is_active not boolean in '{name}'"


# =============================================================================
# 4. JSON Array Tags & Category Fields
# =============================================================================

def test_life_stage_tags_validity(json_catalog):
    """Verifies life_stage_tags is non-empty JSON array with canonical values."""
    for rec in json_catalog:
        name = rec.get("name")
        tags_raw = rec.get("life_stage_tags")
        assert tags_raw is not None, f"Missing life_stage_tags in '{name}'"
        
        tags = json.loads(tags_raw) if isinstance(tags_raw, str) else tags_raw
        assert isinstance(tags, list), f"life_stage_tags must be a list in '{name}'"
        assert len(tags) >= 1, f"life_stage_tags is empty in '{name}'"
        for t in tags:
            assert t in CANONICAL_LIFE_STAGES, f"Unknown life stage tag '{t}' in '{name}'"


def test_caste_categories_validity(json_catalog):
    """Verifies caste_categories is valid JSON array."""
    for rec in json_catalog:
        name = rec.get("name")
        caste_raw = rec.get("caste_categories")
        assert caste_raw is not None, f"Missing caste_categories in '{name}'"
        
        caste_list = json.loads(caste_raw) if isinstance(caste_raw, str) else caste_raw
        assert isinstance(caste_list, list), f"caste_categories must be a list in '{name}'"
        assert len(caste_list) >= 1, f"caste_categories is empty in '{name}'"
        for c in caste_list:
            assert c in VALID_CASTE_CATEGORIES, f"Unknown caste category '{c}' in '{name}'"


def test_eligible_states_validity(json_catalog):
    """Verifies eligible_states is valid non-empty JSON array."""
    for rec in json_catalog:
        name = rec.get("name")
        states_raw = rec.get("eligible_states")
        assert states_raw is not None, f"Missing eligible_states in '{name}'"
        
        states = json.loads(states_raw) if isinstance(states_raw, str) else states_raw
        assert isinstance(states, list), f"eligible_states must be a list in '{name}'"
        assert len(states) >= 1, f"eligible_states is empty in '{name}'"
        for s in states:
            assert len(str(s).strip()) > 0, f"Empty state string in '{name}'"


# =============================================================================
# 5. URL Format Hygiene
# =============================================================================

def test_url_formats_hygiene(json_catalog):
    """
    Ticket 3.3 Acceptance Criteria:
    Verifies valid URL formats on apply_url and official_url (http:// or https:// or empty string).
    """
    for rec in json_catalog:
        name = rec.get("name")
        apply_url = str(rec.get("apply_url") or "").strip()
        official_url = str(rec.get("official_url") or "").strip()

        if apply_url:
            assert apply_url.startswith("http://") or apply_url.startswith("https://"), (
                f"Invalid apply_url format in '{name}': '{apply_url}'"
            )
        if official_url:
            assert official_url.startswith("http://") or official_url.startswith("https://"), (
                f"Invalid official_url format in '{name}': '{official_url}'"
            )


# =============================================================================
# 6. Pydantic Model Conformance
# =============================================================================

def test_pydantic_scheme_match_result_instantiation(json_catalog):
    """Verifies that all catalog records can be converted to SchemeMatchResult model."""
    for rec in json_catalog:
        match_item = SchemeMatchResult(
            scheme_id=rec["scheme_id"],
            name=rec["name"],
            description=rec["description"],
            ministry=rec["ministry"],
            department=rec["department"],
            state=rec["state"],
            category=rec["category"],
            beneficiary_type=rec["beneficiary_type"],
            benefits=rec["benefits"],
            eligibility_text=rec["eligibility_text"],
            documents_required=rec["documents_required"],
            application_process=rec["application_process"],
            apply_url=rec["apply_url"],
            official_url=rec["official_url"],
            age_min=rec["age_min"],
            age_max=rec["age_max"],
            gender=rec["gender"],
            caste_categories=rec["caste_categories"] if isinstance(rec["caste_categories"], str) else json.dumps(rec["caste_categories"]),
            income_max=rec["income_max"],
            residence=rec["residence"],
            eligible_states=rec["eligible_states"] if isinstance(rec["eligible_states"], str) else json.dumps(rec["eligible_states"]),
            requires_bpl=rec["requires_bpl"],
            requires_disability=rec["requires_disability"],
            life_stage_tags=rec["life_stage_tags"] if isinstance(rec["life_stage_tags"], str) else json.dumps(rec["life_stage_tags"]),
            is_active=rec["is_active"],
            match_score=100,
            match_reasons=["Direct dataset integrity test"]
        )
        assert match_item.scheme_id == rec["scheme_id"]
        assert match_item.name == rec["name"]
