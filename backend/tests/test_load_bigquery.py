import sys
import os
import json
import tempfile
from unittest.mock import MagicMock, patch
import pytest

# Ensure scripts directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../scripts")))

from load_bigquery import (
    BQ_SCHEMA_FIELDS,
    get_sdk_schema,
    validate_processed_catalog,
    generate_ndjson,
    load_via_python_sdk,
    load_via_bq_cli
)


@pytest.fixture
def sample_valid_records():
    return [
        {
            "scheme_id": "pm-matru-vandana",
            "name": "Pradhan Mantri Matru Vandana Yojana",
            "description": "Maternity benefit cash transfer scheme.",
            "ministry": "Ministry of Women and Child Development",
            "department": "Department of Women and Child Development",
            "state": "All",
            "category": "Maternity & Health",
            "beneficiary_type": "Pregnant & Lactating Mothers",
            "benefits": "Cash incentive of Rs 5,000",
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
            "is_active": True,
            "updated_at": "2026-09-06T00:00:00Z"
        }
    ]


def test_bq_schema_field_definitions():
    field_names = [f["name"] for f in BQ_SCHEMA_FIELDS]
    assert "scheme_id" in field_names
    assert "name" in field_names
    assert "life_stage_tags" in field_names
    assert "age_min" in field_names
    assert "income_max" in field_names
    assert "requires_bpl" in field_names
    assert len(BQ_SCHEMA_FIELDS) == 26


def test_get_sdk_schema():
    schema = get_sdk_schema()
    assert len(schema) == len(BQ_SCHEMA_FIELDS)
    assert schema[0].name == "scheme_id"
    assert schema[0].mode == "REQUIRED"
    assert schema[1].name == "name"


def test_validate_processed_catalog_success(sample_valid_records):
    is_valid, errors = validate_processed_catalog(sample_valid_records)
    assert is_valid is True
    assert len(errors) == 0


def test_validate_processed_catalog_missing_required():
    invalid_records = [
        {"name": "No Scheme ID Scheme"},
        {"scheme_id": "no-name-scheme", "name": ""}
    ]
    is_valid, errors = validate_processed_catalog(invalid_records)
    assert is_valid is False
    assert len(errors) >= 2


def test_validate_processed_catalog_invalid_types():
    invalid_records = [
        {
            "scheme_id": "bad-types",
            "name": "Bad Types Scheme",
            "age_min": "eighteen",  # Should be int
            "requires_bpl": "yes"    # Should be bool
        }
    ]
    is_valid, errors = validate_processed_catalog(invalid_records)
    assert is_valid is False
    assert any("Expected int" in e for e in errors)
    assert any("Expected bool" in e for e in errors)


def test_generate_ndjson(sample_valid_records):
    with tempfile.NamedTemporaryFile(suffix=".ndjson", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        out_path = generate_ndjson(sample_valid_records, tmp_path)
        assert os.path.exists(out_path)
        with open(out_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        assert len(lines) == 1
        parsed = json.loads(lines[0])
        assert parsed["scheme_id"] == "pm-matru-vandana"
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@patch("google.cloud.bigquery.Client")
def test_load_via_python_sdk_mock(mock_client_cls, sample_valid_records):
    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client

    mock_job = MagicMock()
    mock_job.output_rows = 1
    mock_client.load_table_from_file.return_value = mock_job

    mock_query_job = MagicMock()
    mock_query_job.result.return_value = [{"total_schemes": 1}]
    mock_client.query.return_value = mock_query_job

    with tempfile.NamedTemporaryFile(suffix=".ndjson", mode="w", delete=False) as tmp:
        tmp.write(json.dumps(sample_valid_records[0]) + "\n")
        tmp_path = tmp.name

    try:
        success = load_via_python_sdk("test-project", "yojana_dvar", "schemes_women", tmp_path, sample_valid_records)
        assert success is True
        assert mock_client.load_table_from_file.called
        assert mock_client.query.called
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@patch("subprocess.run")
def test_load_via_bq_cli_mock(mock_subproc):
    mock_subproc.return_value = MagicMock(returncode=0, stdout='[{"total_schemes": 38}]', stderr="")
    success = load_via_bq_cli("test-project", "yojana_dvar", "schemes_women", "/path/to/schemes_women.ndjson")
    assert success is True
    assert mock_subproc.called
