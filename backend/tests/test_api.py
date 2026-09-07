from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# =============================================================================
# 1. Root & Health Endpoints Tests (/, /health, /api/v1/health)
# =============================================================================

def test_root_endpoint():
    """Verify GET / returns HTTP 200 with app info and docs link."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "docs_url" in data

def test_health_endpoint():
    """Verify GET /health returns HTTP 200 with status, version, uptime, and timestamp."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0"
    assert "uptime_seconds" in data
    assert "timestamp" in data

def test_api_v1_health_endpoint():
    """Verify GET /api/v1/health returns HTTP 200 with status and version."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0"

# =============================================================================
# 2. Match Endpoints Tests (/match, /api/v1/match)
# =============================================================================

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
    assert len(data["schemes"]) <= 5
    assert "execution_time_ms" in data
    
    # Also test /api/v1/match alias
    response_v1 = client.post("/api/v1/match", json=payload)
    assert response_v1.status_code == 200

def test_match_personas_integration():
    """
    Verify persona profiles return expected ranked schemes:
    - Sunita (pregnant mother, Bihar, BPL) -> returns PMMVY with high confidence
    - Priya (student, Karnataka, OBC) -> returns schemes
    - Lakshmi (micro-entrepreneur, Tamil Nadu) -> returns schemes
    """
    # 1. Sunita Devi
    sunita_profile = {
        "state": "Bihar",
        "age": 26,
        "gender": "Female",
        "caste": "SC",
        "income": 48000,
        "residence": "Rural",
        "life_stage": "maternal",
        "is_bpl": True,
        "has_disability": False,
        "limit": 10
    }
    res_sunita = client.post("/match", json=sunita_profile)
    assert res_sunita.status_code == 200
    sunita_data = res_sunita.json()
    assert sunita_data["count"] >= 3
    sunita_scheme_ids = [s["scheme_id"] for s in sunita_data["schemes"]]
    assert "pmmvy-central" in sunita_scheme_ids or "pradhan-mantri-matru-vandana-yojana" in sunita_scheme_ids

    # 2. Priya Sharma
    priya_profile = {
        "state": "Karnataka",
        "age": 19,
        "gender": "Female",
        "caste": "OBC",
        "income": 180000,
        "residence": "Urban",
        "life_stage": "student",
        "is_bpl": False,
        "has_disability": False,
        "limit": 10
    }
    res_priya = client.post("/match", json=priya_profile)
    assert res_priya.status_code == 200
    assert res_priya.json()["count"] > 0

    # 3. Lakshmi Ammal
    lakshmi_profile = {
        "state": "Tamil Nadu",
        "age": 42,
        "gender": "Female",
        "caste": "General",
        "income": 220000,
        "residence": "Urban",
        "life_stage": "entrepreneur",
        "is_bpl": False,
        "has_disability": False,
        "limit": 10
    }
    res_lakshmi = client.post("/match", json=lakshmi_profile)
    assert res_lakshmi.status_code == 200
    assert res_lakshmi.json()["count"] > 0

def test_match_endpoint_validation_errors():
    """Verify POST /match returns HTTP 422 for invalid payloads."""
    # Negative age
    res = client.post("/match", json={"age": -5, "gender": "Female"})
    assert res.status_code == 422

    # Excessive age (> 120)
    res = client.post("/match", json={"age": 150, "gender": "Female"})
    assert res.status_code == 422

    # Negative income
    res = client.post("/match", json={"income": -5000})
    assert res.status_code == 422

    # Limit out of bounds (limit=0 or limit=100)
    res = client.post("/match", json={"limit": 0})
    assert res.status_code == 422
    res = client.post("/match", json={"limit": 100})
    assert res.status_code == 422

    # Empty body
    res = client.post("/match", json="invalid-json-structure")
    assert res.status_code == 422

def test_match_endpoint_zero_matches():
    """Verify POST /match returns count=0 cleanly when no schemes match."""
    impossible_profile = {
        "state": "NonExistentState999",
        "age": 115,
        "gender": "Male",
        "caste": "General",
        "income": 999999999,
        "residence": "Urban",
        "life_stage": "maternal",
        "is_bpl": False,
        "has_disability": False
    }
    response = client.post("/match", json=impossible_profile)
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0
    assert len(data["schemes"]) == 0

# =============================================================================
# 3. Personas Endpoints Tests (/personas, /api/v1/personas)
# =============================================================================

def test_get_personas_endpoint():
    """Verify GET /personas and GET /api/v1/personas return array of 3 structured persona objects."""
    response = client.get("/personas")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3
    persona_ids = [p["id"] for p in data]
    assert "priya" in persona_ids
    assert "sunita" in persona_ids
    assert "lakshmi" in persona_ids

    # Check persona structure
    for persona in data:
        assert "id" in persona
        assert "name" in persona
        assert "title" in persona
        assert "subtitle" in persona
        assert "avatar" in persona
        assert "description" in persona
        assert "profile" in persona
        # Profile sub-object verification
        prof = persona["profile"]
        assert "state" in prof
        assert "age" in prof
        assert "gender" in prof
        assert prof["gender"] == "Female"

    # Also test /api/v1/personas alias
    response_v1 = client.get("/api/v1/personas")
    assert response_v1.status_code == 200
    assert len(response_v1.json()) == 3

def test_persona_profiles_can_be_directly_matched():
    """Verify that every demo persona's profile object can be directly sent to /match."""
    personas_res = client.get("/personas")
    assert personas_res.status_code == 200
    personas = personas_res.json()

    for persona in personas:
        match_res = client.post("/match", json=persona["profile"])
        assert match_res.status_code == 200
        match_data = match_res.json()
        assert match_data["count"] > 0
        assert len(match_data["schemes"]) > 0

# =============================================================================
# 4. Explain Endpoints Tests (/explain, /api/v1/explain)
# =============================================================================

def test_post_explain_english_and_hindi():
    """Verify POST /explain returns valid plain-language explanations in English and Hindi."""
    payload_en = {
        "scheme_id": "pmmvy-central",
        "language": "en",
        "profile": {
            "state": "Bihar",
            "age": 26,
            "gender": "Female",
            "caste": "SC",
            "income": 48000,
            "life_stage": "maternal",
            "is_bpl": True
        }
    }
    res_en = client.post("/explain", json=payload_en)
    assert res_en.status_code == 200
    data_en = res_en.json()
    assert data_en["scheme_id"] == "pmmvy-central"
    assert data_en["language"] == "en"
    assert len(data_en["summary"]) > 0
    assert "disclaimer" in data_en

    # Hindi
    payload_hi = dict(payload_en)
    payload_hi["language"] = "hi"
    res_hi = client.post("/explain", json=payload_hi)
    assert res_hi.status_code == 200
    data_hi = res_hi.json()
    assert data_hi["language"] == "hi"
    assert "अस्वीकरण: योजना द्वार" in data_hi["disclaimer"]

def test_post_explain_not_found_and_validation_errors():
    """Verify POST /explain handles nonexistent scheme (404) and invalid request (422)."""
    # Nonexistent scheme
    res_404 = client.post("/explain", json={"scheme_id": "fake-scheme-999", "profile": {}})
    assert res_404.status_code == 404
    assert "not found" in res_404.json()["detail"].lower()

    # Invalid profile inside explain
    res_422 = client.post("/explain", json={"scheme_id": "pmmvy-central", "profile": {"age": -10}})
    assert res_422.status_code == 422

# =============================================================================
# 5. Schemes Catalog Endpoints Tests (/schemes/{id}, /schemes/search)
# =============================================================================

def test_get_scheme_by_id_success():
    """Verify GET /schemes/{scheme_id} returns valid scheme metadata."""
    response = client.get("/schemes/pmmvy-central")
    assert response.status_code == 200
    data = response.json()
    assert data["scheme_id"] in ["pmmvy-central", "pradhan-mantri-matru-vandana-yojana"]
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
