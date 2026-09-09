import os
import json
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.matcher import matcher_service, _find_catalog_path

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ROOT_CATALOG_PATH = os.path.join(BASE_DIR, "data", "processed", "schemes_women.json")
BACKEND_CATALOG_PATH = os.path.join(BASE_DIR, "backend", "data", "processed", "schemes_women.json")

client = TestClient(app)


def test_backend_catalog_cache_exists_and_synced():
    """
    Ticket 4.1 Acceptance Criteria:
    Verify backend/data/processed/schemes_women.json exists and is in sync with root data/processed/schemes_women.json.
    """
    assert os.path.exists(BACKEND_CATALOG_PATH), f"Backend catalog cache not found at {BACKEND_CATALOG_PATH}"
    assert os.path.exists(ROOT_CATALOG_PATH), f"Root catalog not found at {ROOT_CATALOG_PATH}"

    with open(BACKEND_CATALOG_PATH, "r", encoding="utf-8") as f:
        backend_records = json.load(f)

    with open(ROOT_CATALOG_PATH, "r", encoding="utf-8") as f:
        root_records = json.load(f)

    assert len(backend_records) == len(root_records)
    assert len(backend_records) >= 30
    assert backend_records == root_records


def test_matcher_resolves_catalog_path():
    """Verify matcher dynamically resolves valid catalog path."""
    catalog_path = _find_catalog_path()
    assert os.path.exists(catalog_path)
    catalog = matcher_service.get_catalog()
    assert len(catalog) >= 30


def test_api_v1_schemes_endpoint_returns_full_catalog():
    """
    Ticket 4.1 Acceptance Criteria:
    Backend API endpoint /api/v1/schemes returns the full expanded catalog.
    """
    response = client.get("/api/v1/schemes")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "total" in data
    assert "schemes" in data
    assert data["total"] >= 30
    assert data["count"] == data["total"]
    assert len(data["schemes"]) >= 30


def test_schemes_endpoint_returns_full_catalog():
    """Verify /schemes alias returns full catalog."""
    response = client.get("/schemes")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 30
    assert len(data["schemes"]) >= 30


def test_api_v1_schemes_filtering_and_pagination():
    """Verify filtering by state, category, life_stage, and limit/offset."""
    # 1. State filter
    resp_state = client.get("/api/v1/schemes?state=Delhi")
    assert resp_state.status_code == 200
    data_state = resp_state.json()
    assert data_state["total"] >= 1
    for s in data_state["schemes"]:
        assert s["state"].lower() in ["delhi", "all"] or "delhi" in s.get("eligible_states", "").lower()

    # 2. Life-stage filter
    resp_stage = client.get("/api/v1/schemes?life_stage=maternal")
    assert resp_stage.status_code == 200
    data_stage = resp_stage.json()
    assert data_stage["total"] >= 1
    for s in data_stage["schemes"]:
        assert "maternal" in s.get("life_stage_tags", "").lower()

    # 3. Pagination limit & offset
    resp_page = client.get("/api/v1/schemes?limit=5&offset=0")
    assert resp_page.status_code == 200
    data_page = resp_page.json()
    assert data_page["count"] == 5
    assert data_page["total"] >= 30


def test_schemes_search_demographic_filtering():
    """
    TICKET-401 Acceptance Criteria:
    Verify /schemes/search supports age, life_stage, and gender demographic filtering.
    """
    # 1. Search with age filter (Age 10 must only return schemes with age_min <= 10 <= age_max)
    resp_age = client.get("/schemes/search?q=scholarship&age=10&limit=50")
    assert resp_age.status_code == 200
    data_age = resp_age.json()
    assert data_age["count"] > 0
    for s in data_age["schemes"]:
        assert s["age_min"] <= 10 <= s["age_max"]

    # 2. Search with life_stage filter
    resp_stage = client.get("/schemes/search?life_stage=student&limit=50")
    assert resp_stage.status_code == 200
    data_stage = resp_stage.json()
    assert data_stage["count"] > 0
    for s in data_stage["schemes"]:
        assert "student" in s.get("life_stage_tags", "").lower()
