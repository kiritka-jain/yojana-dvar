import json
import logging
import os
import re
from typing import Optional, Dict, Any, List
from google import genai
from app.config import settings
from app.models.profile import ProfileInput
from app.models.explain import ExplainResponse

logger = logging.getLogger("yojana_dvar")

DISCLAIMER_EN = "Disclaimer: Yojana Dvar is an informational gateway and not an official government agency. Official eligibility must be verified on the nodal portal before applying."
DISCLAIMER_HI = "अस्वीकरण: योजना द्वार केवल सूचनात्मक मार्गदर्शन प्रदान करता है। किसी भी योजना के लिए आवेदन करने से पहले आधिकारिक सरकारी पोर्टल पर पात्रता की पुष्टि अवश्य करें।"

class GeminiService:
    """
    Service wrapper for Google Gemini API Client (Tickets 4.1 & 4.2).
    Securely resolves GEMINI_API_KEY from environment or GCP Secret Manager.
    Generates plain-language multilingual eligibility explanations with guardrails.
    """

    def __init__(self):
        self.api_key: Optional[str] = None
        self.client: Optional[genai.Client] = None
        self.is_configured: bool = False
        self.model_name: str = settings.GEMINI_MODEL
        self._initialize()

    def _resolve_api_key(self) -> Optional[str]:
        """Resolves API key from environment variables or GCP Secret Manager."""
        env_key = os.getenv("GEMINI_API_KEY", settings.GEMINI_API_KEY).strip()
        if env_key:
            return env_key

        project_id = os.getenv("GCP_PROJECT_ID", settings.GCP_PROJECT_ID)
        secret_name = os.getenv("GEMINI_SECRET_NAME", settings.GEMINI_SECRET_NAME)

        if project_id and secret_name:
            try:
                from google.cloud import secretmanager
                client = secretmanager.SecretManagerServiceClient()
                secret_path = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
                response = client.access_secret_version(request={"name": secret_path})
                secret_value = response.payload.data.decode("UTF-8").strip()
                if secret_value:
                    logger.info("Successfully retrieved GEMINI_API_KEY from GCP Secret Manager.")
                    return secret_value
            except Exception as e:
                logger.debug(f"Secret Manager access skipped or unavailable: {e}")

        return None

    def _initialize(self):
        """Initializes genai.Client instance if key is available."""
        resolved_key = self._resolve_api_key()
        if not resolved_key:
            self.client = None
            self.is_configured = False
            logger.warning("GEMINI_API_KEY is not configured. Gemini explanation service will use fallback mode.")
            return

        try:
            self.api_key = resolved_key
            self.client = genai.Client(api_key=self.api_key)
            self.is_configured = True
            logger.info("Gemini API client initialized successfully.")
        except Exception as e:
            self.client = None
            self.is_configured = False
            logger.warning(f"Failed to initialize Gemini API client: {e}. Running in fallback mode.")

    def is_available(self) -> bool:
        """Returns True if Gemini client is initialized and ready for requests."""
        return self.is_configured and self.client is not None

    def get_client(self) -> Optional[genai.Client]:
        """Returns initialized genai.Client instance or None."""
        return self.client

    def get_model_name(self) -> str:
        """Returns configured Gemini model identifier."""
        return self.model_name

    def _build_prompt(self, scheme: Dict[str, Any], profile: ProfileInput, lang: str) -> str:
        """Constructs advisory prompt enforcing friendly tone, multilingual output, and guardrails."""
        lang_name = "Hindi (हिंदी)" if lang == "hi" else "English"
        
        prompt = f"""You are Yojana Dvar's compassionate women entitlement advisor.
Explain clearly and simply in {lang_name} why this applicant qualifies for the welfare scheme '{scheme.get('name')}'.

Applicant Demographic Profile:
- Age: {profile.age} years
- Gender: {profile.gender}
- State of Residence: {profile.state}
- Caste Category: {profile.caste}
- Annual Family Income: Rs {profile.income:,}
- Life Stage: {profile.life_stage}
- Below Poverty Line (BPL) Cardholder: {'Yes' if profile.is_bpl else 'No'}
- Disability Status: {'Yes' if profile.has_disability else 'No'}

Scheme Entitlement Details:
- Scheme Name: {scheme.get('name')}
- Ministry: {scheme.get('ministry')}
- Target Beneficiaries: {scheme.get('beneficiary_type')}
- Benefits: {scheme.get('benefits')}
- Eligibility Criteria: {scheme.get('eligibility_text')}
- Required Documents: {scheme.get('documents_required')}
- How to Apply: {scheme.get('application_process')}

Guardrails & Instructions:
1. Tone: Warm, encouraging, empathetic, and plain-language.
2. Advisory only: Do NOT guarantee official approval; state that the applicant meets the eligibility criteria and is encouraged to apply.
3. Language: Generate the entire response strictly in {lang_name}.
4. Output Format: Return ONLY a valid JSON object matching this structure:
{{
  "summary": "Plain language explanation addressing the user directly on why she qualifies.",
  "key_benefits": ["Key benefit 1", "Key benefit 2"],
  "documents_required": ["Document 1", "Document 2"],
  "next_steps": "Actionable instructions on where to apply online or offline."
}}"""
        return prompt

    def _clean_json_response(self, text: str) -> Dict[str, Any]:
        """Strips markdown code fences and parses JSON payload."""
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\n", "", cleaned)
            cleaned = re.sub(r"\n```$", "", cleaned)
        return json.loads(cleaned.strip())

    def _generate_fallback_explanation(self, scheme: Dict[str, Any], profile: ProfileInput, lang: str) -> ExplainResponse:
        """Generates static template explanation when Gemini API is unavailable or rate-limited."""
        scheme_name = scheme.get("name", "Welfare Scheme")
        benefits_raw = scheme.get("benefits", "Government welfare benefits and financial support.")
        docs_raw = scheme.get("documents_required", "Aadhaar Card, Bank Account Details, Identity Proof")
        
        # Parse docs into list
        docs_list = [d.strip() for d in docs_raw.split(",") if d.strip()]
        if not docs_list:
            docs_list = ["Aadhaar Card", "Bank Passbook", "Address Proof"]

        if lang == "hi":
            summary = (
                f"आपकी आयु ({profile.age} वर्ष), राज्य ({profile.state}) और जीवन चरण ({profile.life_stage}) "
                f"के आधार पर आप '{scheme_name}' के लिए उपयुक्त पात्र हैं। यह योजना महिलाओं और उनके परिवारों "
                f"को सामाजिक और आर्थिक सहायता प्रदान करती है।"
            )
            key_benefits = [
                benefits_raw,
                "आधिकारिक सरकारी पोर्टल के माध्यम से प्रत्यक्ष लाभ हस्तांतरण (DBT) सुविधा।"
            ]
            next_steps = f"आवश्यक दस्तावेजों के साथ आधिकारिक पोर्टल ({scheme.get('apply_url', 'सरकारी केंद्र')}) पर आवेदन करें।"
            disclaimer = DISCLAIMER_HI
        else:
            summary = (
                f"Based on your age ({profile.age} years), residence in {profile.state}, and current life stage ({profile.life_stage}), "
                f"you appear eligible for '{scheme_name}'. This scheme provides direct financial and developmental entitlements for women."
            )
            key_benefits = [
                benefits_raw,
                "Direct Benefit Transfer (DBT) into verified bank account."
            ]
            next_steps = f"Apply online through the nodal portal at {scheme.get('apply_url', 'official welfare center')} with required verification documents."
            disclaimer = DISCLAIMER_EN

        return ExplainResponse(
            scheme_id=scheme.get("scheme_id", "scheme"),
            language=lang,
            summary=summary,
            key_benefits=key_benefits,
            documents_required=docs_list,
            next_steps=next_steps,
            disclaimer=disclaimer,
            is_fallback=True
        )

    def generate_explanation(self, scheme: Dict[str, Any], profile: ProfileInput, language: str = "en") -> ExplainResponse:
        """
        Generates multilingual eligibility explanation using Gemini API (with static fallback).
        Ticket 4.2 implementation.
        """
        lang = "hi" if language.lower() in ["hi", "hindi"] else "en"
        disclaimer = DISCLAIMER_HI if lang == "hi" else DISCLAIMER_EN

        if not self.is_available():
            logger.info("Gemini API unavailable. Using static fallback explanation.")
            return self._generate_fallback_explanation(scheme, profile, lang)

        prompt = self._build_prompt(scheme, profile, lang)

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )

            if response and response.text:
                parsed = self._clean_json_response(response.text)
                return ExplainResponse(
                    scheme_id=scheme.get("scheme_id", ""),
                    language=lang,
                    summary=parsed.get("summary", ""),
                    key_benefits=parsed.get("key_benefits", [scheme.get("benefits", "")]),
                    documents_required=parsed.get("documents_required", []),
                    next_steps=parsed.get("next_steps", f"Apply at {scheme.get('apply_url', 'portal')}."),
                    disclaimer=disclaimer,
                    is_fallback=False
                )
        except Exception as e:
            logger.warning(f"Gemini API call failed: {e}. Falling back to static template.")

        return self._generate_fallback_explanation(scheme, profile, lang)

# Global GeminiService Singleton Instance
gemini_service = GeminiService()
