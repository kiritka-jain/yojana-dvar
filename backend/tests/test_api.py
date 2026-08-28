from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_post_match_endpoint():
    """Verify POST /match and POST /api/v1/match returns ranked eligible schemes."""
    payload = {
        "state": "Uttar Pradesh",
        "age": 22,
        "gender": "Female",
        "caste": "General",
        "income": 100000,
        "residence": "All",
        "life_stage": "student",
        "is_bpl": False,
        "has_disability": False,
        "limit": 5
    }
    
    response = client.post("/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "match_id" in data
    assert "count" in data
    assert "schemes" in data
    assert data["count"] > 0
    assert "execution_time_ms" in data
    
    # Also test /api/v1/match alias
    response_v1 = client.post("/api/v1/match", json=payload)
    assert response_v1.status_code == 200

def test_get_scheme_by_id_success():
    """Verify GET /schemes/{scheme_id} returns valid scheme metadata."""
    response = client.get("/schemes/pmmvy-central")
    assert response.status_code == 200
    data = response.json()
    assert data["scheme_id"] == "pmmvy-central"
    assert "Pradhan Mantri Matru Vandana Yojana" in data["name"]

def test_get_scheme_by_id_not_found():
    """Verify GET /schemes/{scheme_id} returns HTTP 404 when scheme doesn't exist."""
    response = client.get("/schemes/non-existent-scheme-999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_search_schemes_endpoint():
    """Verify GET /schemes/search with keyword query parameters."""
    response = client.get("/schemes/search?q=education")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "schemes" in data
    assert data["count"] > 0

def test_search_schemes_with_state_filter():
    """Verify GET /schemes/search with state filter."""
    response = client.get("/schemes/search?state=Tamil Nadu")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "schemes" in data

def test_get_personas_endpoint():
    """Verify GET /personas returns array of 3 structured persona objects."""
    response = client.get("/personas")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3
    persona_ids = [p["id"] for p in data]
    assert "priya" in persona_ids
    assert "sunita" in persona_ids
    assert "lakshmi" in persona_ids
    assert "profile" in data[0]
