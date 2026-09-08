import os
import json
import asyncio
import pytest
from unittest.mock import patch, MagicMock
from app.models.profile import ProfileInput
from app.services.gemini import GeminiService, DISCLAIMER_EN, DISCLAIMER_HI, _trim_text

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
# 2. Prompt Builder & Trimming Tests (_build_prompt & _trim_text)
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

def test_trim_text_helper():
    """Verify text trimming enforces character budget with ellipsis."""
    short_text = "This is short."
    assert _trim_text(short_text, max_chars=50) == short_text

    long_text = "A" * 100
    trimmed = _trim_text(long_text, max_chars=20)
    assert len(trimmed) == 20
    assert trimmed.endswith("...")

    assert _trim_text(None) == ""

def test_select_top_k_schemes(service, sample_profile):
    """Verify select_top_k_schemes bounds output between 1 and 10."""
    schemes = [{"scheme_id": f"s-{i}", "match_score": i * 10, "state": "All"} for i in range(20)]
    
    top_5 = service.select_top_k_schemes(schemes, sample_profile, k=5)
    assert len(top_5) == 5
    assert top_5[0]["scheme_id"] == "s-19"  # Highest match score first

    top_10 = service.select_top_k_schemes(schemes, sample_profile, k=15)  # Cap at 10
    assert len(top_10) == 10

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
    """Verify prompt builder sets Hindi language directives when lang='hi'."""
    prompt = service._build_prompt(sample_scheme, sample_profile, lang="hi")

    assert "in Hindi (हिंदी)" in prompt
    assert "compassionate women entitlement advisor" in prompt

def test_build_portfolio_prompt(service, sample_scheme, sample_profile):
    """Verify portfolio summary prompt builder."""
    prompt = service._build_portfolio_prompt([sample_scheme], sample_profile, lang="en")
    assert "holistic entitlement empowerment summary" in prompt
    assert sample_scheme["name"] in prompt
    assert "action_plan" in prompt

# =============================================================================
# 3. JSON Response Parser Tests (_clean_json_response)
# =============================================================================

def test_clean_json_response_with_markdown_fence(service):
    """Verify stripping of ```json ... ``` markdown wrappers."""
    fenced = """```json
{
  "summary": "You qualify because you are an expectant mother.",
  "key_benefits": ["Cash grant Rs 5000"],
  "documents_required": ["Aadhaar", "MCP Card"],
  "next_steps": "Visit Anganwadi"
}
```"""
    data = service._clean_json_response(fenced)
    assert data["summary"] == "You qualify because you are an expectant mother."
    assert len(data["key_benefits"]) == 1
    assert len(data["documents_required"]) == 2

def test_clean_json_response_without_language_spec(service):
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
# 4. Fallback Explanation Tests
# =============================================================================

def test_generate_fallback_explanation_english(service, sample_scheme, sample_profile):
    """Verify fallback response in English contains disclaimer, catalog description, and structured fields."""
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
    """Verify fallback response in Hindi contains Hindi disclaimer, localized name, and text."""
    fallback = service._generate_fallback_explanation(sample_scheme, sample_profile, lang="hi")

    assert fallback.is_fallback is True
    assert fallback.language == "hi"
    assert fallback.scheme_id == sample_scheme["scheme_id"]
    assert "आपकी आयु" in fallback.summary
    assert fallback.disclaimer == DISCLAIMER_HI
    assert "अस्वीकरण: योजना द्वार" in fallback.disclaimer


def test_generate_fallback_explanation_uniqueness_across_schemes(service, sample_profile):
    """Verify that distinct catalog schemes generate distinct, scheme-specific summaries rather than identical boilerplate."""
    scheme_1 = {
        "scheme_id": "sukanya-samriddhi-yojana",
        "name": "Sukanya Samriddhi Yojana",
        "description": "Small deposit scheme for the girl child offering high guaranteed interest.",
        "benefits": "8.2% annual interest rate with tax exemption under 80C.",
        "documents_required": "Birth Certificate, Aadhaar Card, Guardian ID",
        "application_process": "Apply at nearest Post Office or authorized Commercial Bank.",
        "apply_url": "https://www.indiapost.gov.in"
    }
    scheme_2 = {
        "scheme_id": "delhi-free-dtc-bus-travel-scheme",
        "name": "Delhi Free DTC Bus Travel Scheme (Pink Passes)",
        "description": "Provides 100% free public bus transit for all women in Delhi NCT.",
        "benefits": "Free travel in all DTC and cluster buses with Pink Tickets.",
        "documents_required": "No prior documents required during transit.",
        "application_process": "Collect Pink Ticket upon boarding the bus from conductor.",
        "apply_url": "https://dtc.delhi.gov.in"
    }

    res_1_en = service._generate_fallback_explanation(scheme_1, sample_profile, lang="en")
    res_2_en = service._generate_fallback_explanation(scheme_2, sample_profile, lang="en")
    assert res_1_en.summary != res_2_en.summary
    assert "8.2%" in res_1_en.summary
    assert "Pink Tickets" in res_2_en.summary

    res_1_hi = service._generate_fallback_explanation(scheme_1, sample_profile, lang="hi")
    res_2_hi = service._generate_fallback_explanation(scheme_2, sample_profile, lang="hi")
    assert res_1_hi.summary != res_2_hi.summary
    assert "सुकन्या समृद्धि" in res_1_hi.summary
    assert "पिंक पास" in res_2_hi.summary


def test_build_prompt_includes_description(service, sample_profile):
    """Verify _build_prompt includes the native catalog description in the prompt context."""
    scheme = {
        "name": "Mahila Samman Savings Certificate",
        "ministry": "Ministry of Finance",
        "description": "A two-year deposit facility offering 7.5% fixed interest for women investors.",
        "beneficiary_type": "Women and Girls",
        "benefits": "Fixed 7.5% interest rate compounded quarterly.",
        "eligibility_text": "Any female citizen or guardian of a minor girl.",
        "documents_required": "Aadhaar card, PAN card, Application form",
        "application_process": "Open account at any Post Office."
    }
    prompt = service._build_prompt(scheme, sample_profile, lang="en")
    assert "Description: A two-year deposit facility" in prompt


def test_generate_fallback_portfolio_summary(service, sample_scheme, sample_profile):
    """Verify portfolio summary fallback in English and Hindi."""
    res_en = service._generate_fallback_portfolio_summary([sample_scheme], sample_profile, lang="en")
    assert res_en.is_fallback is True
    assert res_en.top_k_count == 1
    assert len(res_en.action_plan) == 3
    assert res_en.disclaimer == DISCLAIMER_EN

    res_hi = service._generate_fallback_portfolio_summary([sample_scheme], sample_profile, lang="hi")
    assert res_hi.is_fallback is True
    assert "आपकी प्रोफ़ाइल" in res_hi.holistic_summary
    assert res_hi.disclaimer == DISCLAIMER_HI


def test_generate_portfolio_summary_async_mock(service, sample_scheme, sample_profile):
    """Verify asynchronous portfolio summary generation with mocked client."""
    mock_payload = """{
        "holistic_summary": "As a pregnant woman in Bihar, these schemes provide financial and maternal support.",
        "action_plan": ["Step 1: Get MCP card", "Step 2: Apply online", "Step 3: Track status"]
    }"""
    mock_resp = MagicMock()
    mock_resp.text = mock_payload

    with patch.object(service, "is_available", return_value=True):
        with patch.object(service, "client") as mock_client:
            mock_client.models.generate_content.return_value = mock_resp
            result = asyncio.run(service.generate_portfolio_summary_async([sample_scheme], sample_profile, language="en", top_k=5))
            assert result.is_fallback is False
            assert "maternal support" in result.holistic_summary
            assert len(result.action_plan) == 3
