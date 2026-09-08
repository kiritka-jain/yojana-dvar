import asyncio
import concurrent.futures
import json
import logging
import os
import re
from typing import Optional, Dict, Any, List
from google import genai
from app.config import settings
from app.models.profile import ProfileInput
from app.models.explain import ExplainResponse, PortfolioExplainResponse
from app.services.translations import get_localized_scheme_field

logger = logging.getLogger("yojana_dvar")

DISCLAIMER_EN = "Disclaimer: Yojana Dvar is an informational gateway and not an official government agency. Official eligibility must be verified on the nodal portal before applying."
DISCLAIMER_HI = "अस्वीकरण: योजना द्वार केवल सूचनात्मक मार्गदर्शन प्रदान करता है। किसी भी योजना के लिए आवेदन करने से पहले आधिकारिक सरकारी पोर्टल पर पात्रता की पुष्टि अवश्य करें।"

def _trim_text(text: Optional[str], max_chars: int = 300) -> str:
    """Trims narrative text to keep prompt within token budget (Ticket 4.3)."""
    if not text:
        return ""
    clean = str(text).strip()
    if len(clean) <= max_chars:
        return clean
    return clean[:max_chars - 3] + "..."

class GeminiService:
    """
    Service wrapper for Google Gemini API Client (Tickets 4.1, 4.2 & 4.3).
    Securely resolves GEMINI_API_KEY from environment or GCP Secret Manager.
    Enforces strict 15-second timeout on Gemini API calls and provides resilient
    static template fallbacks for zero-downtime UX.
    Supports Top-K context reranking and token budget optimization (Ticket 4.3).
    """

    def __init__(self):
        self.api_key: Optional[str] = None
        self.client: Optional[genai.Client] = None
        self.is_configured: bool = False
        self.model_name: str = settings.GEMINI_MODEL
        self.timeout_seconds: float = settings.GEMINI_TIMEOUT_SECONDS
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

    def select_top_k_schemes(self, schemes: List[Dict[str, Any]], profile: ProfileInput, k: int = 5) -> List[Dict[str, Any]]:
        """
        Reranks and truncates matched schemes to Top-K (default 5, max 10) to optimize prompt token budget (Ticket 4.3).
        """
        k = max(1, min(k, 10))
        if not schemes:
            return []

        # If schemes already have match_score, sort by match_score descending
        sorted_schemes = sorted(
            schemes,
            key=lambda s: (
                -int(s.get("match_score", 0)),
                1 if str(s.get("state", "All")).lower() == profile.state.lower() else 2,
                s.get("scheme_id", "")
            )
        )
        return sorted_schemes[:k]

    def _build_prompt(self, scheme: Dict[str, Any], profile: ProfileInput, lang: str) -> str:
        """Constructs advisory prompt with token-trimmed scheme narratives and native description."""
        lang_name = "Hindi (हिंदी)" if lang == "hi" else "English"
        
        prompt = f"""You are Yojana Dvar's compassionate women entitlement advisor.
Explain clearly and simply in {lang_name} why this applicant qualifies for the welfare scheme '{scheme.get('name')}'.

Applicant Demographic Profile:
- Age: {profile.age} years
- Gender: {profile.gender}
- Marital Status: {getattr(profile, 'marital_status', 'Not specified')}
- State of Residence: {profile.state}
- Caste Category: {profile.caste}
- Annual Family Income: Rs {profile.income:,}
- Life Stage: {profile.life_stage}
- Below Poverty Line (BPL) Cardholder: {'Yes' if profile.is_bpl else 'No'}
- Disability Status: {'Yes' if profile.has_disability else 'No'}

Scheme Entitlement Details:
- Scheme Name: {scheme.get('name')}
- Ministry: {_trim_text(scheme.get('ministry'), 120)}
- Description: {_trim_text(scheme.get('description'), 300)}
- Target Beneficiaries: {_trim_text(scheme.get('beneficiary_type'), 150)}
- Benefits: {_trim_text(scheme.get('benefits'), 300)}
- Eligibility Criteria: {_trim_text(scheme.get('eligibility_text'), 300)}
- Required Documents: {_trim_text(scheme.get('documents_required'), 200)}
- How to Apply: {_trim_text(scheme.get('application_process'), 200)}

Guardrails & Instructions:
1. Tone: Warm, encouraging, empathetic, and plain-language.
2. Advisory only: Do NOT guarantee official approval; state that the applicant meets the eligibility criteria and is encouraged to apply.
3. Language: Generate the entire response strictly in {lang_name}.
4. Document Checklist Note: If scheme is widow pension or marital assistance, explicitly highlight necessary certificates (e.g. Husband's Death Certificate or Marriage Certificate).
5. Output Format: Return ONLY a valid JSON object matching this structure:
{{
  "summary": "Plain language explanation addressing the user directly on why she qualifies.",
  "key_benefits": ["Key benefit 1", "Key benefit 2"],
  "documents_required": ["Document 1", "Document 2"],
  "next_steps": "Actionable instructions on where to apply online or offline."
}}"""
        return prompt

    def _build_portfolio_prompt(self, top_schemes: List[Dict[str, Any]], profile: ProfileInput, lang: str) -> str:
        """Constructs multi-scheme portfolio summary prompt within token budget (Ticket 4.3)."""
        lang_name = "Hindi (हिंदी)" if lang == "hi" else "English"

        schemes_context = []
        for idx, s in enumerate(top_schemes, 1):
            schemes_context.append(
                f"{idx}. {s.get('name')} ({s.get('state', 'Central')}): "
                f"Benefits: {_trim_text(s.get('benefits'), 150)}. "
                f"Criteria: {_trim_text(s.get('eligibility_text'), 150)}."
            )
        schemes_block = "\n".join(schemes_context)

        prompt = f"""You are Yojana Dvar's compassionate women welfare advisor.
Generate a holistic entitlement empowerment summary in {lang_name} for this applicant based on her top matched schemes.

Applicant Profile:
- Age: {profile.age} | State: {profile.state} | Life Stage: {profile.life_stage} | BPL: {'Yes' if profile.is_bpl else 'No'} | Income: Rs {profile.income:,}

Top Matched Schemes ({len(top_schemes)} schemes):
{schemes_block}

Instructions:
1. Write an encouraging holistic summary in {lang_name} describing the combined impact of these entitlements.
2. Provide a 3-step prioritized action plan for applying.
3. Return ONLY a valid JSON object matching:
{{
  "holistic_summary": "Encouraging summary connecting the schemes to her life stage and goals.",
  "action_plan": ["Step 1: ...", "Step 2: ...", "Step 3: ..."]
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
        """Generates dynamic catalog-backed explanation when Gemini API is unavailable or rate-limited."""
        scheme_name_en = scheme.get("name", "Welfare Scheme")
        desc_en = (scheme.get("description") or "").strip()
        benefits_raw = scheme.get("benefits", "Government welfare benefits and financial support.")
        docs_raw = scheme.get("documents_required", "Aadhaar Card, Bank Account Details, Identity Proof")
        app_process = (scheme.get("application_process") or "").strip()
        apply_url = scheme.get("apply_url") or scheme.get("official_url") or "official government portal"
        
        # Parse documents into clean list
        docs_list = [d.strip() for d in docs_raw.split(",") if d.strip()]
        if not docs_list:
            docs_list = ["Aadhaar Card", "Bank Passbook", "Address Proof"]

        if lang == "hi":
            name_hi = get_localized_scheme_field(scheme, "name", "hi") or scheme_name_en
            desc_hi = get_localized_scheme_field(scheme, "description", "hi")
            benefits_hi = get_localized_scheme_field(scheme, "benefits", "hi") or benefits_raw

            if desc_hi and desc_hi != benefits_hi:
                summary = (
                    f"आपकी आयु ({profile.age} वर्ष), राज्य ({profile.state}) और जीवन चरण ({profile.life_stage}) "
                    f"के आधार पर आप '{name_hi}' के लिए उपयुक्त पात्र हैं। {desc_hi} "
                    f"योजना के तहत मुख्य लाभ: {benefits_hi}"
                )
            else:
                summary = (
                    f"आपकी आयु ({profile.age} वर्ष), राज्य ({profile.state}) और जीवन चरण ({profile.life_stage}) "
                    f"के आधार पर आप '{name_hi}' के लिए उपयुक्त पात्र हैं। मुख्य लाभ: {benefits_hi}"
                )

            key_benefits = [
                benefits_hi,
                "आधिकारिक सरकारी पोर्टल अथवा स्थानीय सेवा केंद्र के माध्यम से प्रत्यक्ष लाभ (DBT) सुविधा।"
            ]
            if app_process:
                next_steps = f"{app_process} (आधिकारिक पोर्टल: {apply_url})"
            else:
                next_steps = f"आवश्यक दस्तावेजों के साथ आधिकारिक पोर्टल ({apply_url}) पर आवेदन करें।"
            disclaimer = DISCLAIMER_HI
        else:
            if desc_en and desc_en != benefits_raw:
                summary = (
                    f"Based on your profile (Age {profile.age}, {profile.state}, {profile.life_stage}), "
                    f"you appear eligible for '{scheme_name_en}'. {desc_en} "
                    f"Key entitlements include: {benefits_raw}"
                )
            else:
                summary = (
                    f"Based on your profile (Age {profile.age}, {profile.state}, {profile.life_stage}), "
                    f"you appear eligible for '{scheme_name_en}'. Key entitlements include: {benefits_raw}"
                )

            key_benefits = [
                benefits_raw,
                "Direct Benefit Transfer (DBT) and entitlement distribution through official nodal channels."
            ]
            if app_process:
                next_steps = f"{app_process} (Portal: {apply_url})"
            else:
                next_steps = f"Apply online through the nodal portal at {apply_url} with required verification documents."
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

    def _generate_fallback_portfolio_summary(
        self, top_schemes: List[Dict[str, Any]], profile: ProfileInput, lang: str
    ) -> PortfolioExplainResponse:
        """Generates dynamic catalog-aware portfolio overview when Gemini is unavailable."""
        count = len(top_schemes)
        scheme_names = ", ".join([s.get("name", "Scheme") for s in top_schemes[:3]])
        categories = list({s.get("category") for s in top_schemes if s.get("category")})
        cat_text = ", ".join(categories[:3]) if categories else "social welfare"
        
        if lang == "hi":
            summary = (
                f"आपकी प्रोफ़ाइल ({profile.state}, आयु {profile.age}, जीवन चरण {profile.life_stage}) के आधार पर "
                f"आप {count} प्रमुख कल्याणकारी योजनाओं के लिए पात्र हैं, जिनमें {scheme_names} शामिल हैं। "
                f"ये योजनाएं मुख्य रूप से {cat_text} से संबंधित लाभ प्रदान करती हैं।"
            )
            action_plan = [
                "चरण 1: अपने आधार कार्ड, आय प्रमाण पत्र और बैंक पासबुक को तैयार रखें।",
                "चरण 2: संबंधित योजनाओं के आधिकारिक पोर्टलों पर ऑनलाइन आवेदन करें।",
                "चरण 3: स्थानीय आंगनवाड़ी या नागरिक सेवा केंद्र (CSC) से सत्यापन कराएं।"
            ]
            disclaimer = DISCLAIMER_HI
        else:
            summary = (
                f"Based on your profile ({profile.state}, Age {profile.age}, Life Stage: {profile.life_stage}), "
                f"you qualify for {count} high-impact welfare schemes across {cat_text}, including {scheme_names}."
            )
            action_plan = [
                "Step 1: Organize standard verification documents (Aadhaar, MCP card/Income certificate, Bank Passbook).",
                "Step 2: Submit online applications via official state/central portals.",
                "Step 3: Track application status at nearest Common Service Centre (CSC) or nodal office."
            ]
            disclaimer = DISCLAIMER_EN

        return PortfolioExplainResponse(
            language=lang,
            top_k_count=count,
            holistic_summary=summary,
            top_schemes=[{"scheme_id": s.get("scheme_id"), "name": s.get("name"), "category": s.get("category")} for s in top_schemes],
            action_plan=action_plan,
            disclaimer=disclaimer,
            is_fallback=True
        )

    def _call_gemini_raw(self, prompt: str) -> Optional[str]:
        """Internal worker calling Google GenAI client."""
        if not self.client:
            return None
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt
        )
        return response.text if response else None

    async def generate_explanation_async(
        self, scheme: Dict[str, Any], profile: ProfileInput, language: str = "en"
    ) -> ExplainResponse:
        """
        Asynchronously generates multilingual eligibility explanation enforcing
        a strict 15-second SLA timeout and fallback resilience (Ticket 4.3).
        """
        lang = "hi" if language.lower() in ["hi", "hindi"] else "en"
        disclaimer = DISCLAIMER_HI if lang == "hi" else DISCLAIMER_EN

        if not self.is_available():
            logger.info("Gemini API unavailable. Using static fallback explanation.")
            return self._generate_fallback_explanation(scheme, profile, lang)

        prompt = self._build_prompt(scheme, profile, lang)

        try:
            raw_text = await asyncio.wait_for(
                asyncio.to_thread(self._call_gemini_raw, prompt),
                timeout=self.timeout_seconds
            )

            if raw_text:
                parsed = self._clean_json_response(raw_text)
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
        except asyncio.TimeoutError:
            logger.warning(
                f"Gemini API call timed out after {self.timeout_seconds}s SLA. "
                "Serving static fallback explanation to preserve user experience."
            )
        except Exception as e:
            logger.warning(f"Gemini API call failed ({e}). Serving static fallback explanation.")

        return self._generate_fallback_explanation(scheme, profile, lang)

    async def generate_portfolio_summary_async(
        self, matched_schemes: List[Dict[str, Any]], profile: ProfileInput, language: str = "en", top_k: int = 5
    ) -> PortfolioExplainResponse:
        """
        Generates an AI portfolio summary across Top-K schemes (Ticket 4.3).
        """
        lang = "hi" if language.lower() in ["hi", "hindi"] else "en"
        disclaimer = DISCLAIMER_HI if lang == "hi" else DISCLAIMER_EN
        top_schemes = self.select_top_k_schemes(matched_schemes, profile, k=top_k)

        if not top_schemes or not self.is_available():
            return self._generate_fallback_portfolio_summary(top_schemes, profile, lang)

        prompt = self._build_portfolio_prompt(top_schemes, profile, lang)

        try:
            raw_text = await asyncio.wait_for(
                asyncio.to_thread(self._call_gemini_raw, prompt),
                timeout=self.timeout_seconds
            )

            if raw_text:
                parsed = self._clean_json_response(raw_text)
                return PortfolioExplainResponse(
                    language=lang,
                    top_k_count=len(top_schemes),
                    holistic_summary=parsed.get("holistic_summary", ""),
                    top_schemes=[{"scheme_id": s.get("scheme_id"), "name": s.get("name"), "category": s.get("category")} for s in top_schemes],
                    action_plan=parsed.get("action_plan", []),
                    disclaimer=disclaimer,
                    is_fallback=False
                )
        except Exception as e:
            logger.warning(f"Gemini portfolio summary call failed ({e}). Serving static fallback.")

        return self._generate_fallback_portfolio_summary(top_schemes, profile, lang)

    def generate_explanation(
        self, scheme: Dict[str, Any], profile: ProfileInput, language: str = "en"
    ) -> ExplainResponse:
        """
        Synchronous wrapper enforcing timeout and fallback resilience.
        """
        lang = "hi" if language.lower() in ["hi", "hindi"] else "en"
        disclaimer = DISCLAIMER_HI if lang == "hi" else DISCLAIMER_EN

        if not self.is_available():
            logger.info("Gemini API unavailable. Using static fallback explanation.")
            return self._generate_fallback_explanation(scheme, profile, lang)

        prompt = self._build_prompt(scheme, profile, lang)

        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(self._call_gemini_raw, prompt)
                raw_text = future.result(timeout=self.timeout_seconds)

            if raw_text:
                parsed = self._clean_json_response(raw_text)
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
            logger.warning(f"Gemini API call failed ({e}). Serving static fallback explanation.")

        return self._generate_fallback_explanation(scheme, profile, lang)

# Global GeminiService Singleton Instance
gemini_service = GeminiService()
