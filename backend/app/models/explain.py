from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.profile import ProfileInput

class ExplainRequest(BaseModel):
    """Request payload for Gemini AI eligibility explanation."""
    scheme_id: str = Field(description="Scheme identifier slug (e.g. pmmvy-central)")
    profile: ProfileInput = Field(description="User demographic profile")
    language: str = Field(default="en", description="Target explanation language: 'en' for English, 'hi' for Hindi")

class ExplainResponse(BaseModel):
    """Response payload containing plain-language AI explanation and checklist."""
    scheme_id: str = Field(description="Scheme identifier slug")
    language: str = Field(description="Language of explanation: 'en' or 'hi'")
    summary: str = Field(description="Plain-language explanation of why user qualifies")
    key_benefits: List[str] = Field(description="Summary bullet points of key benefits")
    documents_required: List[str] = Field(description="Clean checklist of documents needed")
    next_steps: str = Field(description="Clear next steps for applying")
    disclaimer: str = Field(description="Mandatory verification advisory disclaimer")
    is_fallback: bool = Field(default=False, description="True if response generated via static fallback template")

class PortfolioExplainRequest(BaseModel):
    """Request payload for Gemini AI portfolio/multi-scheme summary (Ticket 4.3)."""
    profile: ProfileInput = Field(description="User demographic profile")
    scheme_ids: Optional[List[str]] = Field(default=None, description="Optional list of scheme IDs; if None, runs matcher automatically")
    top_k: int = Field(default=5, ge=1, le=10, description="Max Top-K schemes to evaluate in summary")
    language: str = Field(default="en", description="Target language: 'en' for English, 'hi' for Hindi")

class PortfolioExplainResponse(BaseModel):
    """Response payload for multi-scheme holistic summary (Ticket 4.3)."""
    language: str = Field(description="Language: 'en' or 'hi'")
    top_k_count: int = Field(description="Number of schemes evaluated")
    holistic_summary: str = Field(description="High-level empowerment overview")
    top_schemes: List[Dict[str, Any]] = Field(description="Key matched schemes evaluated")
    action_plan: List[str] = Field(description="Prioritized application checklist")
    disclaimer: str = Field(description="Advisory disclaimer")
    is_fallback: bool = Field(default=False, description="True if response generated via static fallback template")
