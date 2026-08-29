import os
from unittest.mock import patch, MagicMock
from app.services.gemini import GeminiService

def test_gemini_service_initialization_without_key():
    """Verify Gemini service initializes gracefully without crashing when key is absent."""
    with patch.dict(os.environ, {"GEMINI_API_KEY": "", "GCP_PROJECT_ID": ""}, clear=True):
        service = GeminiService()
        assert not service.is_available()
        assert service.get_client() is None
        assert service.get_model_name() == "gemini-2.5-flash"

def test_gemini_service_initialization_with_key():
    """Verify Gemini service creates genai.Client instance when key is provided."""
    dummy_key = "AIzaSyDummyKeyTest1234567890"
    with patch.dict(os.environ, {"GEMINI_API_KEY": dummy_key}):
        service = GeminiService()
        assert service.is_available()
        assert service.get_client() is not None
        assert service.api_key == dummy_key

def test_gemini_service_secret_manager_fallback():
    """Verify Gemini service attempts Secret Manager resolution if env var is empty."""
    with patch.dict(os.environ, {"GEMINI_API_KEY": "", "GCP_PROJECT_ID": "test-project", "GEMINI_SECRET_NAME": "gemini-api-key"}):
        with patch("google.cloud.secretmanager.SecretManagerServiceClient") as mock_sm:
            mock_client = MagicMock()
            mock_response = MagicMock()
            mock_response.payload.data = b"AIzaSySecretManagerKeyTest"
            mock_client.access_secret_version.return_value = mock_response
            mock_sm.return_value = mock_client

            service = GeminiService()
            assert service.is_available()
            assert service.api_key == "AIzaSySecretManagerKeyTest"
