import json
import os
import time
import uuid
from typing import List, Dict, Any, Tuple
from app.models.profile import ProfileInput, SchemeMatchResult, MatchResponse

def _find_catalog_path() -> str:
    """Dynamically resolves the path to schemes_women.json across dev and container environments."""
    env_path = os.getenv("SCHEMES_CATALOG_PATH")
    if env_path and os.path.exists(env_path):
        return env_path
        
    current_file = os.path.abspath(__file__)
    # 1. Inside backend root (e.g. /app/data/processed/schemes_women.json in Docker)
    backend_root = os.path.dirname(os.path.dirname(os.path.dirname(current_file)))
    candidate_1 = os.path.join(backend_root, "data", "processed", "schemes_women.json")
    if os.path.exists(candidate_1):
        return candidate_1

    # 2. Inside repo root: data/processed/schemes_women.json
    repo_root = os.path.dirname(backend_root)
    candidate_2 = os.path.join(repo_root, "data", "processed", "schemes_women.json")
    if os.path.exists(candidate_2):
        return candidate_2

    return candidate_1

PROCESSED_CATALOG_PATH = _find_catalog_path()

SCHEME_ID_ALIASES: Dict[str, str] = {
    "pmmvy-central": "pradhan-mantri-matru-vandana-yojana",
    "ssy-central": "sukanya-samriddhi-yojana",
    "step-central": "support-to-training-and-employment-programme-for-women",
    "standup-india-women": "stand-up-india-scheme-for-women-entrepreneurs",
    "ignwps-pension": "indira-gandhi-national-widow-pension-scheme",
    "hf-scheme-001": "post-graduate-indira-gandhi-scholarship-for-single-girl-child",
    "hf-scheme-002": "mahila-samman-savings-certificate",
    "hf-scheme-003": "working-women-hostel-scheme",
}

class EligibilityMatcher:
    """Deterministic rule-based eligibility match engine for Yojana Dvar."""

    def __init__(self, catalog_path: str = PROCESSED_CATALOG_PATH):
        self.catalog_path = catalog_path
        self._catalog_cache: List[Dict[str, Any]] = []

    def get_catalog(self) -> List[Dict[str, Any]]:
        """Loads and caches scheme catalog from processed JSON storage."""
        if not self._catalog_cache:
            if os.path.exists(self.catalog_path):
                with open(self.catalog_path, "r", encoding="utf-8") as f:
                    self._catalog_cache = json.load(f)
            else:
                self._catalog_cache = []
        return self._catalog_cache

    def get_scheme_by_id(self, scheme_id: str) -> Optional[Dict[str, Any]]:
        """Resolves a scheme by its canonical ID or legacy alias."""
        target_id = scheme_id.strip().lower()
        resolved_id = SCHEME_ID_ALIASES.get(target_id, target_id)
        catalog = self.get_catalog()
        for scheme in catalog:
            sid = str(scheme.get("scheme_id", "")).strip().lower()
            if sid == resolved_id or sid == target_id:
                return scheme
        return None

    def evaluate_scheme(self, profile: ProfileInput, scheme: Dict[str, Any]) -> Tuple[bool, int, List[str]]:
        """
        Evaluates hard eligibility rules and computes ranking score.
        Returns: (is_eligible, match_score, match_reasons)
        """
        reasons = []
        
        # 1. Active Status Check
        if not scheme.get("is_active", True):
            return False, 0, []

        # 2. Gender Rule Check
        scheme_gender = str(scheme.get("gender", "Female")).strip().lower()
        user_gender = profile.gender.strip().lower()
        if scheme_gender not in ["all", "all india"]:
            if scheme_gender in ["female", "women"]:
                if user_gender not in ["female", "women"]:
                    return False, 0, []
            elif scheme_gender != user_gender:
                return False, 0, []

        # 3. Age Bounds Check
        age_min = int(scheme.get("age_min", 0))
        age_max = int(scheme.get("age_max", 100))
        if not (age_min <= profile.age <= age_max):
            return False, 0, []
        if profile.age == 0:
            reasons.append(f"Infant / Newborn (<1 yr) eligible within scheme range ({age_min}–{age_max} years)")
        else:
            reasons.append(f"Age {profile.age} is within eligible range ({age_min}–{age_max} years)")

        # 4. State Coverage Check
        scheme_state = str(scheme.get("state", "All")).strip()
        eligible_states_raw = scheme.get("eligible_states", "[\"All\"]")
        try:
            eligible_states = json.loads(eligible_states_raw) if isinstance(eligible_states_raw, str) else eligible_states_raw
        except Exception:
            eligible_states = ["All"]

        user_state = profile.state.strip()
        state_matched = False
        if scheme_state.lower() in ["all", "all india"] or "All" in eligible_states:
            state_matched = True
            reasons.append("Available central scheme across all States/UTs")
        elif scheme_state.lower() == user_state.lower() or any(st.lower() == user_state.lower() for st in eligible_states):
            state_matched = True
            reasons.append(f"Targeted state scheme for residents of {user_state}")
            
        if not state_matched:
            return False, 0, []

        # 5. Caste Category Check
        caste_raw = scheme.get("caste_categories", "[\"All\"]")
        try:
            caste_categories = json.loads(caste_raw) if isinstance(caste_raw, str) else caste_raw
        except Exception:
            caste_categories = ["All"]

        user_caste = profile.caste.strip()
        caste_matched = "All" in caste_categories or any(c.lower() == user_caste.lower() for c in caste_categories)
        if not caste_matched:
            return False, 0, []

        # 6. Max Income Limit Check
        income_max = int(scheme.get("income_max", 0))
        if income_max > 0 and profile.income > income_max:
            return False, 0, []
        if income_max > 0:
            reasons.append(f"Annual income (Rs {profile.income:,}) is within cap (Rs {income_max:,})")

        # 7. Residence Type Check
        scheme_residence = str(scheme.get("residence", "All")).strip().lower()
        user_residence = profile.residence.strip().lower()
        if scheme_residence != "all" and user_residence != "all" and scheme_residence != user_residence:
            return False, 0, []

        # 8. BPL Requirement Check
        requires_bpl = bool(scheme.get("requires_bpl", False))
        if requires_bpl and not profile.is_bpl:
            return False, 0, []
        if requires_bpl and profile.is_bpl:
            reasons.append("Eligible under Below Poverty Line (BPL) entitlement priority")

        # 9. Disability Requirement Check
        requires_disability = bool(scheme.get("requires_disability", False))
        if requires_disability and not profile.has_disability:
            return False, 0, []

        # ----------------------------------------------------------------------
        # Weighted Scoring Algorithm (Section 7.3)
        # ----------------------------------------------------------------------
        score = 50  # Base score for passing all hard rules
        
        # Life Stage Boost (+30)
        tags_raw = scheme.get("life_stage_tags", "[\"general\"]")
        try:
            life_stage_tags = json.loads(tags_raw) if isinstance(tags_raw, str) else tags_raw
        except Exception:
            life_stage_tags = ["general"]
            
        user_life_stage = profile.life_stage.strip().lower()
        is_stage_match = any(tag.lower() == user_life_stage for tag in life_stage_tags)
        if not is_stage_match and user_life_stage == "widow":
            scheme_text = f"{scheme.get('name', '')} {scheme.get('beneficiary_type', '')} {scheme.get('eligibility_text', '')}".lower()
            if "widow" in scheme_text:
                is_stage_match = True

        if is_stage_match:
            score += 30
            reasons.append(f"Directly matches your target life stage ('{profile.life_stage}')")

        # State Specificity Boost (+20)
        if scheme_state.lower() == user_state.lower() and scheme_state.lower() != "all":
            score += 20

        # Income Targeting Boost (+10)
        if income_max > 0:
            score += 10
            
        # Cap score at 100%
        final_score = min(score, 100)
        return True, final_score, reasons

    def match_profile(self, profile: ProfileInput) -> MatchResponse:
        """Runs match engine against input profile and returns ranked results."""
        start_time = time.time()
        catalog = self.get_catalog()
        
        eligible_results: List[SchemeMatchResult] = []
        
        for scheme in catalog:
            is_eligible, score, reasons = self.evaluate_scheme(profile, scheme)
            if is_eligible:
                res = SchemeMatchResult(
                    scheme_id=scheme.get("scheme_id", ""),
                    name=scheme.get("name", ""),
                    description=scheme.get("description", ""),
                    ministry=scheme.get("ministry", ""),
                    department=scheme.get("department", ""),
                    state=scheme.get("state", "All"),
                    category=scheme.get("category", ""),
                    beneficiary_type=scheme.get("beneficiary_type", ""),
                    benefits=scheme.get("benefits", ""),
                    eligibility_text=scheme.get("eligibility_text", ""),
                    documents_required=scheme.get("documents_required", ""),
                    application_process=scheme.get("application_process", ""),
                    apply_url=scheme.get("apply_url", ""),
                    official_url=scheme.get("official_url", ""),
                    age_min=int(scheme.get("age_min", 0)),
                    age_max=int(scheme.get("age_max", 100)),
                    gender=scheme.get("gender", "Female"),
                    caste_categories=str(scheme.get("caste_categories", "[\"All\"]")),
                    income_max=int(scheme.get("income_max", 0)),
                    residence=scheme.get("residence", "All"),
                    eligible_states=str(scheme.get("eligible_states", "[\"All\"]")),
                    requires_bpl=bool(scheme.get("requires_bpl", False)),
                    requires_disability=bool(scheme.get("requires_disability", False)),
                    life_stage_tags=str(scheme.get("life_stage_tags", "[\"general\"]")),
                    is_active=bool(scheme.get("is_active", True)),
                    match_score=score,
                    match_reasons=reasons
                )
                eligible_results.append(res)

        # Sort by match_score descending, then scheme_id
        eligible_results.sort(key=lambda s: (-s.match_score, s.scheme_id))
        
        # Limit results
        top_results = eligible_results[:profile.limit]
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        
        return MatchResponse(
            match_id=str(uuid.uuid4()),
            count=len(top_results),
            schemes=top_results,
            execution_time_ms=elapsed_ms
        )

# Global Matcher Singleton Instance
matcher_service = EligibilityMatcher()
