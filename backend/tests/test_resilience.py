import asyncio
import time
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.gemini import gemini_service

client = TestClient(app)

SAMPLE_PAYLOAD = {
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

def test_gemini_api_timeout_fallback():
    """
    Acceptance Criteria (Ticket 4.3):
    If Gemini call exceeds timeout SLA, API returns HTTP 200 with template fallback explanation without breaking UX.
    """
    def slow_gemini_call(*args, **kwargs):
        # Simulate a Gemini API call that hangs / exceeds timeout
        time.sleep(1.0)
        return '{"summary": "Too late"}'

    # Temporarily set timeout to a short duration for fast testing
    original_timeout = gemini_service.timeout_seconds
    gemini_service.timeout_seconds = 0.05

    try:
        with patch.object(gemini_service, "is_available", return_value=True):
            with patch.object(gemini_service, "_call_gemini_raw", side_effect=slow_gemini_call):
                response = client.post("/explain", json=SAMPLE_PAYLOAD)
                assert response.status_code == 200
                data = response.json()
                assert data["is_fallback"] is True
                assert data["scheme_id"] in ["pmmvy-central", "pradhan-mantri-matru-vandana-yojana"]
                assert "disclaimer" in data
                assert "Pradhan Mantri Matru Vandana Yojana" in data["summary"]
    finally:
        gemini_service.timeout_seconds = original_timeout

def test_gemini_api_error_fallback():
    """
    Acceptance Criteria (Ticket 4.3):
    If Gemini call fails (e.g. rate limit, network error, 500 from Google),
    API returns HTTP 200 with template fallback explanation.
    """
    with patch.object(gemini_service, "is_available", return_value=True):
        with patch.object(gemini_service, "_call_gemini_raw", side_effect=Exception("429 ResourceExhausted: Quota exceeded")):
            response = client.post("/explain", json=SAMPLE_PAYLOAD)
            assert response.status_code == 200
            data = response.json()
            assert data["is_fallback"] is True
            assert len(data["documents_required"]) > 0
            assert "disclaimer" in data

def test_gemini_synchronous_timeout_fallback():
    """
    Verify that the synchronous wrapper generate_explanation also respects the timeout.
    """
    def slow_call(*args, **kwargs):
        time.sleep(1.0)
        return '{"summary": "Too late"}'

    original_timeout = gemini_service.timeout_seconds
    gemini_service.timeout_seconds = 0.05

    try:
        from app.models.profile import ProfileInput
        profile = ProfileInput(age=26, gender="Female", state="Bihar")
        scheme = {"scheme_id": "test-scheme", "name": "Test Scheme"}

        with patch.object(gemini_service, "is_available", return_value=True):
            with patch.object(gemini_service, "_call_gemini_raw", side_effect=slow_call):
                result = gemini_service.generate_explanation(scheme, profile, "en")
                assert result.is_fallback is True
                assert result.scheme_id == "test-scheme"
    finally:
        gemini_service.timeout_seconds = original_timeout
