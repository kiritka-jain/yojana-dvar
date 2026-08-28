from typing import List
from fastapi import APIRouter
from app.models.persona import Persona
from app.models.profile import ProfileInput

router = APIRouter(tags=["Demo Personas"])

DEMO_PERSONAS: List[Persona] = [
    Persona(
        id="priya",
        name="Priya Sharma",
        title="19yo Student in Karnataka",
        subtitle="OBC Category • Higher Education Seeker",
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        description="19-year-old female student from Karnataka looking for higher education scholarships and skill training.",
        profile=ProfileInput(
            state="Karnataka",
            age=19,
            gender="Female",
            caste="OBC",
            income=180000,
            residence="Urban",
            life_stage="student",
            occupation="Student",
            education="Undergraduate",
            is_bpl=False,
            has_disability=False,
            limit=10
        )
    ),
    Persona(
        id="sunita",
        name="Sunita Devi",
        title="26yo Pregnant Mother in Bihar",
        subtitle="SC Category • BPL Household • Maternal Care",
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita",
        description="26-year-old pregnant mother from rural Bihar living in a BPL household eligible for maternity & nutrition benefits.",
        profile=ProfileInput(
            state="Bihar",
            age=26,
            gender="Female",
            caste="SC",
            income=48000,
            residence="Rural",
            life_stage="maternal",
            occupation="Homemaker",
            education="Secondary",
            is_bpl=True,
            has_disability=False,
            limit=10
        )
    ),
    Persona(
        id="lakshmi",
        name="Lakshmi Ammal",
        title="42yo Micro-Entrepreneur in Tamil Nadu",
        subtitle="General Category • Business Loan & Skill Seeker",
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Lakshmi",
        description="42-year-old woman entrepreneur in Tamil Nadu seeking business loans, handicraft training, and self-employment support.",
        profile=ProfileInput(
            state="Tamil Nadu",
            age=42,
            gender="Female",
            caste="General",
            income=220000,
            residence="Urban",
            life_stage="entrepreneur",
            occupation="Self-Employed / Artisan",
            education="Diploma",
            is_bpl=False,
            has_disability=False,
            limit=10
        )
    )
]

@router.get(
    "/personas",
    response_model=List[Persona],
    summary="Get 3 pre-built demo personas for 1-click discovery testing"
)
@router.get(
    "/api/v1/personas",
    response_model=List[Persona],
    include_in_schema=False
)
async def get_demo_personas():
    """
    Returns array of 3 pre-built demo persona objects (Priya, Sunita, Lakshmi).
    Acceptance Criteria (Ticket 3.4).
    """
    return DEMO_PERSONAS
