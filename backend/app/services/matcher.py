import json
import os
import time
import uuid
from typing import List, Dict, Any, Tuple, Optional
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

RESTRICTIVE_OCCUPATION_GATES: List[Tuple[str, List[str]]] = [
    ("safai karamchari", ["daily wage labor", "other", "self-employed / artisan", "sanitation worker"]),
    ("sanitation worker", ["daily wage labor", "other", "self-employed / artisan", "sanitation worker"]),
    ("manual scavenger", ["daily wage labor", "other"]),
    ("construction worker", ["daily wage labor", "construction worker"]),
    ("building worker", ["daily wage labor"]),
    ("bocw", ["daily wage labor"]),
    ("beedi worker", ["daily wage labor", "self-employed / artisan", "other"]),
    ("bidi worker", ["daily wage labor", "self-employed / artisan", "other"]),
    ("handloom", ["self-employed / artisan", "daily wage labor"]),
    ("weaver", ["self-employed / artisan", "daily wage labor"]),
    ("street vendor", ["self-employed / artisan", "daily wage labor", "other"]),
    ("svanidhi", ["self-employed / artisan", "daily wage labor", "other"]),
    ("hawker", ["self-employed / artisan", "daily wage labor", "other"]),
    ("anganwadi", ["salaried", "other"]),
    ("asha worker", ["salaried", "other"]),
    ("ex-servicem", []),
    ("war widow", []),
    ("agricultural skill development", ["farmer", "daily wage labor"]),
    ("training programme for farmers", ["farmer"]),
    ("women farmers and farmers", ["farmer"]),
    ("brackish water aquaculture", ["farmer", "self-employed / artisan"]),
]

# Pan-India Statutory Minor & Child Labour Guardrails (Child Labour Act 2016 / Indian Contract Act 1872 / RTE Act 2009)
COMMERCIAL_ENTERPRISE_KEYWORDS: List[str] = [
    "msme", "micro enterprise", "small enterprise", "medium enterprise",
    "mega industry", "large industry", "thrust sector", "industrial unit",
    "plant and machinery", "term loan", "working capital", "interest subsidy",
    "capital subsidy", "sgst reimbursement", "stamp duty", "epf reimbursement",
    "patent registration", "quality certification", "power connection charges",
    "udyam", "dpiit", "investor facilitation", "working women hostel", "working woman hostel",
    "mudra", "stand up india", "stand-up india", "business loan",
    "credit facility", "subsidy for enterprise", "commercial loan",
    "entrepreneurship development", "assistance to msme", "assistance to mega",
    "assistance to large", "shop & establishment", "shop and establishment",
    "factory", "commercial production", "industrial undertaking"
]

COMMERCIAL_AGRI_AQUA_KEYWORDS: List[str] = [
    "aquaculture", "brackish water", "fish farming", "shrimp farming",
    "horticulture loan", "tractor subsidy", "harvester subsidy",
    "agri-infrastructure", "commercial dairy", "poultry farm",
    "agricultural skill development", "farmer training programme",
    "training programme for women farmers", "training programme for farmers",
    "fisheries development", "marine fisheries", "inland fisheries",
    "pmmsy", "coastal aquaculture authority"
]

EXEMPT_CHILD_EDUCATION_KEYWORDS: List[str] = [
    "girl child", "balika", "sukanya", "school", "scholarship", "vidyarthi",
    "chhatravritti", "pre-matric", "post-matric", "poshan", "mid day meal",
    "mid-day meal", "child welfare", "anganwadi", "infant", "newborn",
    "pediatric", "immunization", "education", "tuition", "hostel for students",
    "shiksha", "vidya", "merit-cum-means"
]


class EligibilityMatcher:
    """Deterministic rule-based eligibility match engine for Yojana Dvar."""

    def __init__(self, catalog_path: str = PROCESSED_CATALOG_PATH):
        self.catalog_path = catalog_path
        self._catalog_cache: List[Dict[str, Any]] = []

    def get_catalog(self) -> List[Dict[str, Any]]:
        """Loads and caches scheme catalog from processed JSON storage with pre-indexed metadata."""
        if not self._catalog_cache:
            if os.path.exists(self.catalog_path):
                with open(self.catalog_path, "r", encoding="utf-8") as f:
                    raw_catalog = json.load(f)
                for s in raw_catalog:
                    tags_raw = s.get("life_stage_tags", "[]")
                    if isinstance(tags_raw, str):
                        try:
                            s["_clean_tags"] = [str(t).strip().lower() for t in json.loads(tags_raw)]
                        except Exception:
                            s["_clean_tags"] = ["general"]
                    elif isinstance(tags_raw, list):
                        s["_clean_tags"] = [str(t).strip().lower() for t in tags_raw]
                    else:
                        s["_clean_tags"] = ["general"]
                    s["_clean_tags_set"] = set(s["_clean_tags"])

                    states_raw = s.get("eligible_states", "[\"All\"]")
                    if isinstance(states_raw, str):
                        try:
                            s["_eligible_states"] = [st.lower() for st in json.loads(states_raw)]
                        except Exception:
                            s["_eligible_states"] = ["all"]
                    elif isinstance(states_raw, list):
                        s["_eligible_states"] = [str(st).lower() for st in states_raw]
                    else:
                        s["_eligible_states"] = ["all"]
                    s["_eligible_states_set"] = set(s["_eligible_states"])

                    caste_raw = s.get("caste_categories", "[\"All\"]")
                    if isinstance(caste_raw, str):
                        try:
                            s["_caste_categories"] = [c.lower() for c in json.loads(caste_raw)]
                        except Exception:
                            s["_caste_categories"] = ["all"]
                    elif isinstance(caste_raw, list):
                        s["_caste_categories"] = [str(c).lower() for c in caste_raw]
                    else:
                        s["_caste_categories"] = ["all"]
                    s["_caste_categories_set"] = set(s["_caste_categories"])

                    s["_state_lower"] = str(s.get("state", "All")).strip().lower()
                    s["_gender_lower"] = str(s.get("gender", "Female")).strip().lower()
                    s["_category_lower"] = str(s.get("category", "")).strip().lower()
                    s["_full_text"] = f"{s.get('name', '')} {s.get('category', '')} {s.get('beneficiary_type', '')} {s.get('eligibility_text', '')}".lower()

                self._catalog_cache = raw_catalog
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
        scheme_gender = scheme.get("_gender_lower", str(scheme.get("gender", "Female")).strip().lower())
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

        # 3.1 Life-Stage Incompatibility Hard Gate & Reverse Demographic Gating (Ticket YD-ENG-2.2 / TICKET-202)
        clean_tags = scheme.get("_clean_tags")
        if clean_tags is None:
            tags_raw = scheme.get("life_stage_tags", "[\"general\"]")
            try:
                life_stage_tags = json.loads(tags_raw) if isinstance(tags_raw, str) else tags_raw
            except Exception:
                life_stage_tags = ["general"]
            clean_tags = [str(t).strip().lower() for t in life_stage_tags if str(t).strip()]
        clean_tags_set = scheme.get("_clean_tags_set", set(clean_tags))

        scheme_full_text = scheme.get("_full_text")
        if scheme_full_text is None:
            scheme_full_text = f"{scheme.get('name', '')} {scheme.get('category', '')} {scheme.get('beneficiary_type', '')} {scheme.get('eligibility_text', '')}".lower()

        user_life_stage = profile.life_stage.strip().lower()
        user_occupation = (profile.occupation or "").strip().lower()

        # (a) Exclusive Student Scheme Gate:
        # If scheme is exclusively for students/scholarships and user age > 30 or user life_stage == "senior" -> Disqualify
        is_student_exclusive = clean_tags_set == {"student"} or ("student" in clean_tags_set and "scholarship" in scheme_full_text and "entrepreneur" not in clean_tags_set and "general" not in clean_tags_set)
        if is_student_exclusive:
            if profile.age > 30 or user_life_stage == "senior":
                return False, 0, []

        # (b) Maternal / Marriage Scheme Gate:
        # Maternal/marriage schemes are strictly for women in maternal/legal marriage age (18–50) and never seniors or minors
        category_lower = scheme.get("_category_lower", str(scheme.get("category", "")).strip().lower())
        is_maternal_or_marriage = clean_tags_set == {"maternal"} or "maternal" in category_lower or any(kw in scheme_full_text for kw in ["pregnant", "maternity", "lactating", "marriage assistance", "kanya vivah", "wedding aid", "vivah hetu"])
        if is_maternal_or_marriage:
            if not any(cw in scheme_full_text for cw in ["girl child", "balika", "sukanya"]):
                if profile.age < 18 or profile.age > 50 or user_life_stage == "senior":
                    return False, 0, []

        # (c) Senior Citizen / Old-Age Pension Gate:
        # Senior citizen schemes strictly require age >= 60 (excluding widow/divyang specific exceptions)
        is_senior_pension = any(kw in scheme_full_text for kw in ["old age pension", "senior citizen pension", "vridha pension", "vruddha pension", "vaya vandana", "vridhavastha"])
        if is_senior_pension and not any(kw in scheme_full_text for kw in ["widow", "vidhwa", "divyang", "disability", "orphan", "family pension"]):
            if profile.age < 60:
                return False, 0, []

        # (d) Pan-India Statutory Minor & Child Labour Hard Gate (Tickets YD-RULE-101, YD-RULE-102, YD-RULE-103)
        # Under Child & Adolescent Labour Act 2016, Indian Contract Act 1872, and RTE Act 2009:
        # Minors (<18) and Students are strictly barred from commercial enterprise, industrial subsidy,
        # commercial aquaculture/farming, debt-bearing loans, and adult trade labor schemes.
        if profile.age < 18 or user_life_stage == "student" or user_occupation == "student":
            category_lower = scheme.get("_category_lower", str(scheme.get("category", "")).strip().lower())
            is_commercial_category = any(cat in category_lower for cat in [
                "business & entrepreneurship", "banking, financial services and insurance", "business", "entrepreneurship"
            ])
            has_enterprise_kw = any(kw in scheme_full_text for kw in COMMERCIAL_ENTERPRISE_KEYWORDS)
            has_agri_aqua_kw = any(kw in scheme_full_text for kw in COMMERCIAL_AGRI_AQUA_KEYWORDS)
            is_child_exempt = any(cw in scheme_full_text for cw in EXEMPT_CHILD_EDUCATION_KEYWORDS)

            if (is_commercial_category or has_enterprise_kw or has_agri_aqua_kw) and not is_child_exempt:
                return False, 0, []


        # 3.2 Marital Status Incompatibility Gate
        user_marital = (profile.marital_status or "all").strip().lower()

        # (a) Exclusive Widow Scheme Gate:
        is_widow_scheme = "widow" in scheme_full_text or clean_tags_set == {"widow"}
        if is_widow_scheme and user_marital in ["unmarried", "married", "intercaste_marriage"] and user_life_stage != "widow":
            return False, 0, []

        # (b) Exclusive Inter-caste Scheme Gate:
        is_intercaste_scheme = "intercaste" in scheme_full_text or "inter-caste" in scheme_full_text
        if is_intercaste_scheme and user_marital not in ["intercaste_marriage", "all"]:
            return False, 0, []

        # 3.3 Restrictive Occupation & Beneficiary Hard Gate (TICKET-201)
        user_occupation = (profile.occupation or "").strip().lower()

        for keyword, allowed_occupations in RESTRICTIVE_OCCUPATION_GATES:
            if keyword in scheme_full_text:
                # Disqualify minors or explicit students from manual labor / trade schemes
                if profile.age < 18 or user_life_stage == "student" or user_occupation == "student":
                    return False, 0, []
                # If specific allowed occupations are configured and user provided an occupation
                if allowed_occupations and user_occupation:
                    if not any(allowed in user_occupation for allowed in allowed_occupations):
                        return False, 0, []
                elif not allowed_occupations:
                    # Schemes strictly for defense / ex-servicemen without matching status
                    return False, 0, []

        # 4. State Coverage Check
        scheme_state_lower = scheme.get("_state_lower", str(scheme.get("state", "All")).strip().lower())
        eligible_states_set = scheme.get("_eligible_states_set")
        if eligible_states_set is None:
            eligible_states_raw = scheme.get("eligible_states", "[\"All\"]")
            try:
                eligible_states = [st.lower() for st in (json.loads(eligible_states_raw) if isinstance(eligible_states_raw, str) else eligible_states_raw)]
            except Exception:
                eligible_states = ["all"]
            eligible_states_set = set(eligible_states)

        user_state = profile.state.strip()
        user_state_lower = user_state.lower()
        state_matched = False
        if scheme_state_lower in ["all", "all india"] or "all" in eligible_states_set:
            state_matched = True
            reasons.append("Available central scheme across all States/UTs")
        elif scheme_state_lower == user_state_lower or user_state_lower in eligible_states_set:
            state_matched = True
            reasons.append(f"Targeted state scheme for residents of {user_state}")
            
        if not state_matched:
            return False, 0, []

        # 5. Caste Category Check
        caste_categories_set = scheme.get("_caste_categories_set")
        if caste_categories_set is None:
            caste_raw = scheme.get("caste_categories", "[\"All\"]")
            try:
                caste_categories = [c.lower() for c in (json.loads(caste_raw) if isinstance(caste_raw, str) else caste_raw)]
            except Exception:
                caste_categories = ["all"]
            caste_categories_set = set(caste_categories)

        user_caste_lower = profile.caste.strip().lower()
        caste_matched = "all" in caste_categories_set or user_caste_lower in caste_categories_set
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
        user_life_stage = profile.life_stage.strip().lower()
        is_stage_match = any(tag == user_life_stage for tag in clean_tags)
        if not is_stage_match and user_life_stage == "widow":
            if "widow" in scheme_full_text:
                is_stage_match = True

        if is_stage_match:
            score += 30
            reasons.append(f"Directly matches your target life stage ('{profile.life_stage}')")

        # Marital Status Specificity Boost (+25)
        if user_marital == "widow" and is_widow_scheme:
            score += 25
            reasons.append("Eligible under Widow Pension social security priority (Husband's Death Certificate required)")
        elif user_marital == "intercaste_marriage" and is_intercaste_scheme:
            score += 25
            reasons.append("Eligible for Inter-Caste Marriage Incentive Grant (Registered Marriage Certificate required)")
        elif user_marital == "unmarried" and ("single girl" in scheme_full_text or "unmarried" in scheme_full_text):
            score += 15
            reasons.append("Eligible under single / unmarried girl child welfare priority")

        # State Specificity Boost (+20)
        if scheme_state_lower == user_state_lower and scheme_state_lower != "all":
            score += 20

        # Income Targeting Boost (+10)
        if income_max > 0:
            score += 10

        # Occupation Alignment Boost (+15)
        if user_occupation and user_occupation not in ["other", ""]:
            if user_occupation in scheme_full_text or (user_occupation == "student" and "student" in clean_tags):
                score += 15
                reasons.append(f"Targeted for your occupation category ('{profile.occupation}')")
            
        # Cap score at 100%
        final_score = min(score, 100)
        return True, final_score, reasons

    def match_profile(self, profile: ProfileInput) -> MatchResponse:
        """Runs match engine against input profile and returns ranked results."""
        start_time = time.time()
        catalog = self.get_catalog()
        
        eligible_candidates: List[Tuple[int, str, Dict[str, Any], List[str]]] = []
        
        for scheme in catalog:
            is_eligible, score, reasons = self.evaluate_scheme(profile, scheme)
            if is_eligible:
                eligible_candidates.append((score, str(scheme.get("scheme_id", "")), scheme, reasons))

        # Sort by match_score descending, then scheme_id
        eligible_candidates.sort(key=lambda item: (-item[0], item[1]))
        
        # Limit results before Pydantic instantiation for high throughput
        top_candidates = eligible_candidates[:profile.limit]
        top_results = [
            SchemeMatchResult(
                scheme_id=sch.get("scheme_id", ""),
                name=sch.get("name", ""),
                description=sch.get("description", ""),
                ministry=sch.get("ministry", ""),
                department=sch.get("department", ""),
                state=sch.get("state", "All"),
                category=sch.get("category", ""),
                beneficiary_type=sch.get("beneficiary_type", ""),
                benefits=sch.get("benefits", ""),
                eligibility_text=sch.get("eligibility_text", ""),
                documents_required=sch.get("documents_required", ""),
                application_process=sch.get("application_process", ""),
                apply_url=sch.get("apply_url", ""),
                official_url=sch.get("official_url", ""),
                age_min=int(sch.get("age_min", 0)),
                age_max=int(sch.get("age_max", 100)),
                gender=sch.get("gender", "Female"),
                caste_categories=str(sch.get("caste_categories", "[\"All\"]")),
                income_max=int(sch.get("income_max", 0)),
                residence=sch.get("residence", "All"),
                eligible_states=str(sch.get("eligible_states", "[\"All\"]")),
                requires_bpl=bool(sch.get("requires_bpl", False)),
                requires_disability=bool(sch.get("requires_disability", False)),
                life_stage_tags=str(sch.get("life_stage_tags", "[\"general\"]")),
                is_active=bool(sch.get("is_active", True)),
                match_score=sc,
                match_reasons=rs
            )
            for sc, _, sch, rs in top_candidates
        ]
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        
        return MatchResponse(
            match_id=str(uuid.uuid4()),
            count=len(top_results),
            schemes=top_results,
            execution_time_ms=elapsed_ms
        )

# Global Matcher Singleton Instance
matcher_service = EligibilityMatcher()
