from typing import List
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
