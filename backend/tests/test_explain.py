from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_PAYLOAD_EN = {
    "scheme_id": "pmmvy-central",
    "language": "en",
    "profile": {
        "state": "Bihar",
        "age": 26,
        "gender": "Female",
        "caste": "SC",
        "income": 48000,
        "residence": "Rural",
        "life_stage": "maternal",
        "is_bpl": True,
        "has_disability": False
    }
}

SAMPLE_PAYLOAD_HI = {
    "scheme_id": "pmmvy-central",
    "language": "hi",
    "profile": {
        "state": "Bihar",
        "age": 26,
        "gender": "Female",
        "caste": "SC",
        "income": 48000,
        "residence": "Rural",
        "life_stage": "maternal",
        "is_bpl": True,
        "has_disability": False
    }
}

def test_explain_endpoint_english():
    """Verify POST /explain returns English explanation with mandatory disclaimer."""
    response = client.post("/explain", json=SAMPLE_PAYLOAD_EN)
    assert response.status_code == 200
    data = response.json()
    assert data["scheme_id"] == "pmmvy-central"
    assert data["language"] == "en"
    assert len(data["summary"]) > 0
    assert isinstance(data["key_benefits"], list)
    assert isinstance(data["documents_required"], list)
    assert "disclaimer" in data
    assert "Disclaimer: Yojana Dvar is an informational gateway" in data["disclaimer"]

def test_explain_endpoint_hindi():
    """Verify POST /explain returns Hindi explanation with mandatory Hindi disclaimer."""
    response = client.post("/explain", json=SAMPLE_PAYLOAD_HI)
    assert response.status_code == 200
    data = response.json()
    assert data["scheme_id"] == "pmmvy-central"
    assert data["language"] == "hi"
    assert len(data["summary"]) > 0
    assert "अस्वीकरण: योजना द्वार" in data["disclaimer"]

def test_explain_endpoint_scheme_not_found():
    """Verify POST /explain returns 404 for invalid scheme_id."""
    invalid_payload = dict(SAMPLE_PAYLOAD_EN)
    invalid_payload["scheme_id"] = "non-existent-scheme"
    response = client.post("/explain", json=invalid_payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_explain_with_gemini_client_success():
    """Verify Gemini API client output is properly parsed when Gemini returns valid JSON."""
    mock_gemini_json = """{
        "summary": "You are eligible for Pradhan Mantri Matru Vandana Yojana because you are an expecting mother.",
        "key_benefits": ["Rs 5000 in direct cash transfer", "Nutritional support"],
        "documents_required": ["Aadhaar Card", "MCP Card", "Bank Account Details"],
        "next_steps": "Visit your local Anganwadi center or apply online at pmmvy.wcd.gov.in."
    }"""
    
    mock_response = MagicMock()
    mock_response.text = mock_gemini_json

    from app.services.gemini import gemini_service
    with patch.object(gemini_service, "is_available", return_value=True):
        with patch.object(gemini_service, "client") as mock_client:
            mock_client.models.generate_content.return_value = mock_response
            response = client.post("/explain", json=SAMPLE_PAYLOAD_EN)
            assert response.status_code == 200
            data = response.json()
            assert data["is_fallback"] is False
            assert "expecting mother" in data["summary"]
            assert len(data["key_benefits"]) == 2
            assert "Disclaimer: Yojana Dvar" in data["disclaimer"]
