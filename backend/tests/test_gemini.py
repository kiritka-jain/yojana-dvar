import os
import json
import pytest
from unittest.mock import patch, MagicMock
from app.models.profile import ProfileInput
from app.services.gemini import GeminiService, DISCLAIMER_EN, DISCLAIMER_HI

# =============================================================================
# 1. Initialization and Auth Tests
# =============================================================================

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

@pytest.fixture
def service():
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-dummy-key", "GCP_PROJECT_ID": ""}):
        return GeminiService()

# =============================================================================
# 2. Prompt Builder Tests (_build_prompt)
# =============================================================================

@pytest.fixture
def sample_scheme():
    return {
        "scheme_id": "pmmvy-central",
        "name": "Pradhan Mantri Matru Vandana Yojana",
        "ministry": "Ministry of Women and Child Development",
        "beneficiary_type": "Pregnant Women and Lactating Mothers",
        "benefits": "Rs 5,000 direct cash benefit in DBT mode",
        "eligibility_text": "Pregnant women for the first living child of the family",
        "documents_required": "Aadhaar card, MCP card, Bank passbook",
        "application_process": "Apply at local Anganwadi Centre or through PMMVY portal",
        "apply_url": "https://pmmvy.wcd.gov.in"
    }

@pytest.fixture
def sample_profile():
    return ProfileInput(
        state="Bihar",
        age=26,
        gender="Female",
        caste="SC",
        income=48000,
        residence="Rural",
        life_stage="maternal",
        is_bpl=True,
        has_disability=False
    )

def test_build_prompt_english(service, sample_scheme, sample_profile):
    """Verify prompt builder sets English language directives, profile info, and guardrails."""
    prompt = service._build_prompt(sample_scheme, sample_profile, lang="en")

    # Language specification
    assert "in English" in prompt
    # Scheme details
    assert sample_scheme["name"] in prompt
    assert sample_scheme["ministry"] in prompt
    assert sample_scheme["benefits"] in prompt
    # Profile details
    assert f"Age: {sample_profile.age}" in prompt
    assert f"State of Residence: {sample_profile.state}" in prompt
    assert "Annual Family Income: Rs 48,000" in prompt
    assert "Below Poverty Line (BPL) Cardholder: Yes" in prompt
    assert "Disability Status: No" in prompt
    # Guardrails
    assert "compassionate women entitlement advisor" in prompt
    assert "Advisory only" in prompt
    assert "Do NOT guarantee official approval" in prompt
    assert "valid JSON object" in prompt

def test_build_prompt_hindi(service, sample_scheme, sample_profile):
    """Verify prompt builder sets Hindi (हिंदी) language directive and guardrails."""
    prompt = service._build_prompt(sample_scheme, sample_profile, lang="hi")

    # Language directive
    assert "Hindi (हिंदी)" in prompt
    # Scheme name embedded
    assert sample_scheme["name"] in prompt
    # Guardrails present
    assert "strictly in Hindi (हिंदी)" in prompt
    assert "valid JSON object" in prompt

# =============================================================================
# 3. Clean JSON Response Tests (_clean_json_response)
# =============================================================================

def test_clean_json_response_raw(service):
    """Verify parsing of clean unescaped JSON string."""
    raw = '{"summary": "Eligible", "key_benefits": ["Cash aid"], "documents_required": ["Aadhaar"], "next_steps": "Apply"}'
    data = service._clean_json_response(raw)
    assert data["summary"] == "Eligible"
    assert data["key_benefits"] == ["Cash aid"]

def test_clean_json_response_markdown_fenced(service):
    """Verify stripping of markdown ```json and ``` code blocks."""
    fenced = """```json
{
  "summary": "You qualify for this grant.",
  "key_benefits": ["Rs 10,000 grant"],
  "documents_required": ["Voter ID"],
  "next_steps": "Visit Panchayat"
}
```"""
    data = service._clean_json_response(fenced)
    assert data["summary"] == "You qualify for this grant."
    assert data["next_steps"] == "Visit Panchayat"

def test_clean_json_response_generic_fenced(service):
    """Verify stripping of markdown ``` without language identifier."""
    fenced = """```
{
  "summary": "Eligible under youth quota.",
  "key_benefits": ["Skill stipend"],
  "documents_required": ["Marksheet"],
  "next_steps": "Register at portal"
}
```"""
    data = service._clean_json_response(fenced)
    assert data["summary"] == "Eligible under youth quota."

def test_clean_json_response_invalid_json_raises(service):
    """Verify invalid JSON payload raises json.JSONDecodeError."""
    with pytest.raises(json.JSONDecodeError):
        service._clean_json_response("This is not JSON text at all.")

# =============================================================================
# 4. Fallback Explanation Tests (_generate_fallback_explanation)
# =============================================================================

def test_generate_fallback_explanation_english(service, sample_scheme, sample_profile):
    """Verify fallback response in English contains disclaimer and structured fields."""
    fallback = service._generate_fallback_explanation(sample_scheme, sample_profile, lang="en")

    assert fallback.is_fallback is True
    assert fallback.language == "en"
    assert fallback.scheme_id == sample_scheme["scheme_id"]
    assert sample_scheme["name"] in fallback.summary
    assert str(sample_profile.age) in fallback.summary
    assert sample_profile.state in fallback.summary
    assert len(fallback.key_benefits) > 0
    assert len(fallback.documents_required) == 3
    assert fallback.disclaimer == DISCLAIMER_EN

def test_generate_fallback_explanation_hindi(service, sample_scheme, sample_profile):
    """Verify fallback response in Hindi contains Hindi disclaimer and text."""
    fallback = service._generate_fallback_explanation(sample_scheme, sample_profile, lang="hi")

    assert fallback.is_fallback is True
    assert fallback.language == "hi"
    assert fallback.scheme_id == sample_scheme["scheme_id"]
    assert "आपकी आयु" in fallback.summary
    assert fallback.disclaimer == DISCLAIMER_HI
    assert "अस्वीकरण: योजना द्वार" in fallback.disclaimer
