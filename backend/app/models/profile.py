from typing import List, Optional
from pydantic import BaseModel, Field, model_validator

class ProfileInput(BaseModel):
    """Demographic input model for eligibility matching."""
    state: str = Field(default="All", description="User's state of residence")
    age: int = Field(default=25, ge=0, le=120, description="User's age in years")
    gender: str = Field(default="Female", description="User's gender (Female, Male, Other)")
    caste: str = Field(default="General", description="Caste category (General, SC, ST, OBC)")
    income: int = Field(default=0, ge=0, le=1000000000, description="Annual family income in INR")
    residence: str = Field(default="All", description="Residence type (Rural, Urban, All)")
    marital_status: str = Field(default="all", description="User marital status (unmarried, married, intercaste_marriage, widow, divorced, all)")
    life_stage: str = Field(default="general", description="Life stage tag (student, maternal, widow, entrepreneur, senior, general, all)")
    occupation: Optional[str] = Field(default="", description="User's current occupation")
    education: Optional[str] = Field(default="", description="Highest education level")
    is_bpl: bool = Field(default=False, description="Below Poverty Line cardholder flag")
    has_disability: bool = Field(default=False, description="Disability flag")
    limit: int = Field(default=10, ge=1, le=50, description="Max number of matched schemes to return")

    @model_validator(mode='after')
    def validate_cross_field_age_constraints(self) -> 'ProfileInput':
        stage = (self.life_stage or "").strip().lower()
        marital = (self.marital_status or "").strip().lower()

        # Age-gating for marital statuses requiring legal age (18+)
        if marital in ['married', 'intercaste_marriage', 'widow', 'divorced'] and self.age < 18:
            raise ValueError(f"Marital status '{marital}' requires legal age >= 18")

        # Age-gating for maternal / pregnancy schemes (18+)
        if stage == 'maternal' and self.age < 18:
            raise ValueError("Maternal life stage requires age >= 18")

        # Age-gating for widow schemes (18+)
        if stage == 'widow' and self.age < 18:
            raise ValueError("Widow status requires age >= 18")

        # Age-gating for entrepreneur schemes (18+)
        if stage == 'entrepreneur' and self.age < 18:
            raise ValueError("Entrepreneur life stage requires age >= 18")

        # Age-gating for senior citizen status (60+)
        if stage == 'senior' and self.age < 60:
            raise ValueError("Senior citizen status requires age >= 60")

        return self

class SchemeMatchResult(BaseModel):
    """Matched scheme output model with confidence score and match reasons."""
    scheme_id: str
    name: str
    description: str
    ministry: str
    department: str
    state: str
    category: str
    beneficiary_type: str
    benefits: str
    eligibility_text: str
    documents_required: str
    application_process: str
    apply_url: str
    official_url: str
    age_min: int
    age_max: int
    gender: str
    caste_categories: str
    income_max: int
    residence: str
    eligible_states: str
    requires_bpl: bool
    requires_disability: bool
    life_stage_tags: str
    is_active: bool
    # Localized Hindi fields (Epic 1: YD-I18N-101)
    name_hi: Optional[str] = Field(default=None, description="Localized Hindi scheme name")
    ministry_hi: Optional[str] = Field(default=None, description="Localized Hindi ministry / department name")
    category_hi: Optional[str] = Field(default=None, description="Localized Hindi category")
    benefits_hi: Optional[str] = Field(default=None, description="Localized Hindi benefits summary")
    description_hi: Optional[str] = Field(default=None, description="Localized Hindi description")
    application_process_hi: Optional[str] = Field(default=None, description="Localized Hindi application process and steps")
    documents_required_hi: Optional[str] = Field(default=None, description="Localized Hindi required documents checklist")
    eligibility_text_hi: Optional[str] = Field(default=None, description="Localized Hindi eligibility criteria narrative")
    match_score: int = Field(description="Normalized match confidence score (0-100%)")
    match_reasons: List[str] = Field(default=[], description="Key reasons why user qualifies for scheme")

class MatchResponse(BaseModel):
    """Envelope response model for /match API endpoint."""
    match_id: str
    count: int
    schemes: List[SchemeMatchResult]
    execution_time_ms: float
