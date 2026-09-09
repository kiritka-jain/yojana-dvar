#!/usr/bin/env python3
"""
ETL Ingestion Script for Yojana Dvar (Ticket 2.2)
=================================================
Processes raw scheme datasets from local staging (`data/raw/`),
applies women-centric filtering rules, parses & standardizes fields according to TDD Section 4.1,
deduplicates schemes by `scheme_id` slug, and exports clean catalog data to `data/processed/`.

Outputs:
  - data/processed/schemes_women.json
  - data/processed/schemes_women.csv
"""

import argparse
import csv
import datetime
import json
import os
import re
import sys

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
DATA_PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

# Expanded Women Filter Keywords (Section 6.2 - English, Transliterated & Regional)
WOMEN_KEYWORDS = [
    "women", "woman", "girl", "girls", "female", "mahila", "matru", "matritva",
    "sukanya", "widow", "widows", "vidhwa", "kanya", "ladli", "ladki", "maternal",
    "maternity", "mother", "mothers", "penn", "sakhi", "she", "daughter", "daughters",
    "nari", "balika", "pregnant", "pregnancy", "lactating", "lactation", "shg",
    "self-help group", "self help group", "anganwadi", "asha", "samman", "poshan",
    "pudhumai", "kudumbashree", "cheyutha", "orunodoi", "didi", "beti", "bahu",
    "devi", "stree", "housewife", "homemaker", "housewives", "homemakers",
    "single girl child", "bhagini", "ammaiyar", "majhi ladki", "ladli behna",
    "stand-up india", "stand up india", "maharani", "sister", "sisters"
]

# Devanagari Hindi Keywords
DEVANAGARI_WOMEN_KEYWORDS = [
    "महिला", "मातृ", "मातृत्व", "सुकन्या", "कन्या", "लाडली", "लाड़की", "नारी",
    "बालिका", "विधवा", "बेटी", "दीदी", "स्त्री", "सखी", "गर्भवती", "स्तनपान",
    "स्वयं सहायता", "पोषण", "गृहलक्ष्मी", "सम्मान"
]

# Strict Male-Only Exclusion Patterns
MALE_EXCLUSIVE_KEYWORDS = [
    "boys only", "men only", "male only", "exclusively for boys",
    "only for male candidates", "only for boys", "male applicants only",
    "for men and boys", "boys and young men only"
]

# Audited Explicit Scheme Age Bounds (Ticket YD-DATA-2.1 / TICKET-101)
SCHEME_EXPLICIT_AGE_BOUNDS = {
    # Student / Education / Youth schemes
    "gaura-devi-kanya-dhan-yojana": (14, 22),
    "moovalur-ramamirtham-ammaiyar-higher-education-assurance-scheme": (17, 25),
    "mukhyamantri-kanya-utthan-yojana": (0, 25),
    "mukhya-mantri-kanya-sumangala-yojana": (0, 25),
    "sukanya-samriddhi-yojana": (0, 10),
    "cbse-single-girl-child-scholarship": (14, 20),
    "pragati-scholarship-scheme-for-girl-students": (16, 25),
    "begum-hazrat-mahal-national-scholarship": (14, 22),
    "kalpana-chawla-chhatravriti-yojana": (17, 25),
    "post-matric-scholarship-for-girls": (15, 30),

    # Working Women / Hostels / Shelters
    "working-women-hostel-scheme": (18, 60),
    "working-women-hostel": (18, 60),
    "sakhi-niwas-working-women-hostel": (18, 60),
    "working-women-hostels": (18, 60),
    "swadhar-greh-scheme": (18, 60),
    "ujjawala-scheme": (18, 60),
    "one-stop-centre-scheme": (18, 100),
    "sakhi-one-stop-centre": (18, 100),

    # Marriage / Kalyanam / Vivah
    "kanya-sumangala-mukhyamantri-kanya-vivah-yojana": (18, 45),
    "mukhyamantri-kanya-vivah-yojana": (18, 45),
    "mukhyamantri-kanya-vivah-nikah-yojana": (18, 45),
    "shadi-shagun-scheme": (18, 45),
    "kalyana-lakshmi-shaadi-mubarak": (18, 45),
    "rupashree-prakalpa": (18, 45),
    "majhi-bhagyashree-kanya-yojana": (0, 18),

    # Livelihood / Entrepreneurship / Loans / Micro-finance
    "kudumbashree-women-empowerment-livelihood-mission": (18, 65),
    "mission-shakti-odisha": (18, 65),
    "pm-street-vendors-atmanirbhar-nidhi": (18, 70),
    "pm-svanidhi": (18, 70),
    "stand-up-india-scheme": (18, 70),
    "pradhan-mantri-mudra-yojana-pmmy": (18, 65),
    "mudra-yojana": (18, 65),
    "mahila-samman-savings-certificate": (18, 100),
    "stree-shakti-package-for-women-entrepreneurs": (18, 65),
    "dena-shakti-scheme": (18, 65),
    "udyogini-scheme": (18, 55),
    "annapurna-scheme": (18, 65),
    "bhartiya-mahila-bank-business-loan": (18, 65),
    "trade-related-entrepreneurship-assistance-and-development-tread": (18, 65),
    "national-safai-karamcharis-finance-development-corporation-nskfdc": (18, 65),
    "credit-facility-for-safai-karamcharis": (18, 65),
    "swarojgar-credit-card-scheme": (18, 65),

    # Direct Benefit / Universal Welfare
    "gruha-lakshmi-scheme": (18, 100),
    "mahalakshmi-scheme": (18, 100),
    "orunodoi-20-scheme": (18, 100),
    "griha-aadhar-scheme": (18, 100),
    "ladli-behna-yojana": (21, 60),

    # Maternal / Reproductive Health
    "pradhan-mantri-matru-vandana-yojana-pmmvy": (18, 50),
    "janani-suraksha-yojana-jsy": (18, 50),
    "janani-shishu-suraksha-karyakram-jssk": (18, 50),

    # Pensions / Senior Support
    "indira-gandhi-national-old-age-pension-scheme-ignoaps": (60, 100),
    "indira-gandhi-national-widow-pension-scheme-ignwps": (40, 79),
    "atal-pension-yojana": (18, 40),
    "pradhan-mantri-vaya-vandana-yojana": (60, 100),
    "national-pension-scheme-for-traders-and-self-employed-persons": (18, 40),
}

# Canonical Life-Stage Tags (Section 6.1 / Ticket 2.3)
CANONICAL_LIFE_STAGES = ["maternal", "student", "entrepreneur", "senior", "general"]

# Life-Stage Pattern Dictionaries (Ticket 2.3)
LIFE_STAGE_PATTERNS = {
    "maternal": [
        "pregnant", "pregnancy", "maternal", "maternity", "lactating", "lactation",
        "infant", "child birth", "delivery", "postnatal", "prenatal", "newborn",
        "pmmvy", "matru", "matritva", "janani", "jsy", "mcp card", "safe motherhood",
        "immunization", "antenatal", "गर्भ", "मातृ", "मातृत्व", "स्तनपान"
    ],
    "student": [
        "student", "students", "scholarship", "scholarships", "education", "school",
        "schools", "college", "colleges", "university", "universities", "undergraduate",
        "post-graduation", "post-graduate", "master's degree", "degree", "diploma",
        "intermediate", "class 1", "class 6", "class 8", "class 9", "class 10",
        "class 12", "10th pass", "12th pass", "kanyashree", "pudhumai penn",
        "kanya utthan", "sumangala", "gaura devi", "tuition", "fellowship",
        "sukanya samriddhi", "sukanya", "girl child education", "higher education",
        "stem", "hostel", "study", "learning", "छात्र", "छात्रा", "शिक्षा", "छात्रवृत्ति", "स्कूल"
    ],
    "entrepreneur": [
        "entrepreneur", "entrepreneurs", "business", "loan", "loans", "micro-credit",
        "microcredit", "working capital", "shg", "self-help group", "self help group",
        "livelihood", "livelihoods", "stand-up india", "stand up india", "mudra",
        "svanidhi", "street vendor", "street vendors", "vendor", "vendors", "hawker",
        "kudumbashree", "mission shakti", "utkarsh", "joint liability", "jleg",
        "cheyutha", "micro-enterprise", "micro enterprise", "enterprise", "enterprises",
        "artisans", "artisan", "vocational training", "step", "self-employment",
        "self employment", "subsidy", "credit facility", "swarojgar", "handloom",
        "उद्यम", "व्यवसाय", "ऋण", "स्वयं सहायता"
    ],
    "senior": [
        "widow", "widows", "vidhwa", "pension", "pensions", "elderly", "senior citizen",
        "senior citizens", "old age", "old-age", "ignwps", "destitute widow",
        "destitute widows", "pensioner", "superannuated", "aged 60", "above 60",
        "40-79 years", "elderly women", "वृद्ध", "पेंशन", "विधवा"
    ],
    "general": [
        "housing", "shelter", "sakhi niwas", "ujjwala", "lpg", "gas connection",
        "sanitation", "bus travel", "free bus", "transport", "travel", "pink pass",
        "pink ticket", "mahalakshmi", "basic income", "cash assistance", "cash transfer",
        "ladli behna", "majhi ladki", "gruha lakshmi", "orunodoi", "maiya samman",
        "chiranjeevi", "swasthya bima", "health insurance", "healthcare", "ration",
        "bpl", "homemaker", "housewife", "housewives", "griha aadhar", "samman",
        "vivah", "marriage assistance", "kanya vivah", "आवास", "स्वास्थ्य", "राशन"
    ]
}

def classify_life_stage(record: dict) -> list:
    """
    Life-Stage Classifier & Automated Tagging (Ticket 2.3).
    Categorizes a scheme into one or more of the 5 canonical life-stage tags:
    ['maternal', 'student', 'entrepreneur', 'senior', 'general'].
    """
    if not record or not isinstance(record, dict):
        return ["general"]

    # Aggregate text fields for semantic scoring
    title_text = str(
        record.get("name") or record.get("scheme_name") or
        record.get("Scheme Name") or record.get("title") or ""
    )
    beneficiary_text = str(
        record.get("beneficiary_type") or record.get("target_beneficiary") or
        record.get("Beneficiaries") or ""
    )
    category_text = str(
        record.get("category") or record.get("scheme_category") or
        record.get("Category") or record.get("domain") or ""
    )
    description_text = str(
        record.get("description") or record.get("Details") or
        record.get("summary") or ""
    )
    eligibility_text = str(
        record.get("eligibility_text") or record.get("eligibility_criteria_text") or
        record.get("Eligibility") or ""
    )
    benefits_text = str(
        record.get("benefits") or record.get("scheme_benefits") or
        record.get("Benefits") or ""
    )

    full_text = f"{title_text} {category_text} {beneficiary_text} {description_text} {eligibility_text} {benefits_text}".lower()

    stage_scores = {stage: 0 for stage in CANONICAL_LIFE_STAGES}

    # Weight title matches higher (+3)
    title_lower = title_text.lower()
    for stage, patterns in LIFE_STAGE_PATTERNS.items():
        for pat in patterns:
            if pat in title_lower:
                stage_scores[stage] += 3
            elif pat in full_text:
                stage_scores[stage] += 1

    # Specific category domain boosts
    cat_lower = category_text.lower()
    if "education" in cat_lower or "learning" in cat_lower:
        stage_scores["student"] += 2
    if "business" in cat_lower or "entrepreneurship" in cat_lower or "skills" in cat_lower or "employment" in cat_lower:
        stage_scores["entrepreneur"] += 2
    if "maternal" in cat_lower or ("health" in cat_lower and any(w in full_text for w in ["pregnant", "infant", "lactating"])):
        stage_scores["maternal"] += 2

    # Specific age bounds checks
    age_min = clean_int(record.get("age_min") or record.get("min_age"), 0)
    age_max = clean_int(record.get("age_max") or record.get("max_age"), 100)
    if 0 <= age_min <= 10 and age_max <= 25:
        stage_scores["student"] += 1
    if age_min >= 40 and "widow" in full_text:
        stage_scores["senior"] += 2
    if age_min >= 60:
        stage_scores["senior"] += 2

    # Determine assigned stages
    assigned_tags = []
    specialized_stages = ["maternal", "student", "entrepreneur", "senior"]
    max_spec_score = max(stage_scores[s] for s in specialized_stages)

    if max_spec_score >= 2:
        for s in specialized_stages:
            if stage_scores[s] >= 2 and stage_scores[s] >= (max_spec_score - 1):
                assigned_tags.append(s)
    elif max_spec_score == 1:
        best_s = max(specialized_stages, key=lambda s: stage_scores[s])
        assigned_tags.append(best_s)

    if not assigned_tags:
        assigned_tags.append("general")
    elif "general" not in assigned_tags and stage_scores["general"] >= 4:
        assigned_tags.append("general")

    # If explicit tag was provided and is valid, merge or prioritize
    explicit_raw = record.get("life_stage")
    if explicit_raw and isinstance(explicit_raw, str):
        exp_clean = explicit_raw.strip().lower()
        if exp_clean in CANONICAL_LIFE_STAGES and exp_clean not in assigned_tags:
            assigned_tags.insert(0, exp_clean)

    return assigned_tags if assigned_tags else ["general"]


def slugify(text: str) -> str:
    """Converts a scheme title into a unique clean slug identifier."""
    if not text:
        return "unknown-scheme"
    text = str(text).lower().strip()
    text = re.sub(r'\(.*?\)', '', text).strip()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-') or "scheme"

def classify_women_relevancy(record: dict) -> dict:
    """
    Multi-Criteria Women & Girl-Child Relevancy Classifier (Ticket 2.2).
    Evaluates gender tags, women-centric keywords (English, transliterated & Devanagari),
    target beneficiaries, ministries, and negative exclusion filters.
    
    Returns a dict with:
      - is_relevant: bool
      - confidence_score: float (0.0 to 1.0)
      - matched_keywords: list[str]
      - is_male_exclusive: bool
      - reasons: list[str]
    """
    if not record or not isinstance(record, dict):
        return {
            "is_relevant": False,
            "confidence_score": 0.0,
            "matched_keywords": [],
            "is_male_exclusive": False,
            "reasons": ["Empty or invalid record payload"]
        }

    # Extract all text sources
    gender_raw = str(
        record.get("gender") or record.get("gender_applicable") or
        record.get("Beneficiaries") or record.get("target_beneficiary") or ""
    ).strip().lower()

    title_text = str(
        record.get("name") or record.get("scheme_name") or
        record.get("Scheme Name") or record.get("title") or ""
    ).strip()

    beneficiary_text = str(
        record.get("beneficiary_type") or record.get("target_beneficiary") or
        record.get("Beneficiaries") or ""
    ).strip()

    category_text = str(
        record.get("category") or record.get("scheme_category") or
        record.get("Category") or record.get("domain") or ""
    ).strip()

    ministry_text = str(
        record.get("ministry") or record.get("ministry_name") or
        record.get("Ministry") or record.get("organization") or ""
    ).strip()

    description_text = str(
        record.get("description") or record.get("Details") or
        record.get("summary") or ""
    ).strip()

    eligibility_text = str(
        record.get("eligibility_text") or record.get("eligibility_criteria_text") or
        record.get("Eligibility") or ""
    ).strip()

    benefits_text = str(
        record.get("benefits") or record.get("scheme_benefits") or
        record.get("Benefits") or ""
    ).strip()

    full_searchable = f"{title_text} {category_text} {beneficiary_text} {ministry_text} {description_text} {eligibility_text} {benefits_text}".lower()

    # 1. Negative male-exclusive check
    is_male_exclusive = any(pattern in full_searchable for pattern in MALE_EXCLUSIVE_KEYWORDS)
    if is_male_exclusive:
        # Check if there are explicit female overrides (e.g. co-ed, widow exception)
        has_female_override = any(kw in full_searchable for kw in ["female", "widow", "women", "girl", "mother"])
        if not has_female_override:
            return {
                "is_relevant": False,
                "confidence_score": 0.0,
                "matched_keywords": [],
                "is_male_exclusive": True,
                "reasons": ["Filtered out: Explicitly restricted to male beneficiaries only"]
            }

    reasons = []
    matched_keywords = []
    confidence_points = 0.0

    # 2. Gender check
    explicit_female_genders = ["female", "women", "woman", "girl", "widow", "mother", "pregnant"]
    if any(g in gender_raw for g in explicit_female_genders):
        confidence_points += 0.50
        reasons.append(f"Explicit target gender indicator: '{gender_raw}'")

    # 3. Ministry check
    if any(w in ministry_text.lower() for w in ["women and child", "women empowerment", "wcd", "mission shakti"]):
        confidence_points += 0.25
        reasons.append(f"Administered by Women-Centric Ministry: '{ministry_text}'")

    # 4. Keyword match check (English & Transliterated)
    for kw in WOMEN_KEYWORDS:
        if re.search(r'\b' + re.escape(kw) + r'\b', full_searchable, re.IGNORECASE) or kw in full_searchable:
            if kw not in matched_keywords:
                matched_keywords.append(kw)

    # 5. Devanagari Keyword match check
    for kw in DEVANAGARI_WOMEN_KEYWORDS:
        if kw in full_searchable and kw not in matched_keywords:
            matched_keywords.append(kw)

    if matched_keywords:
        kw_score = min(0.40, len(matched_keywords) * 0.10)
        confidence_points += kw_score
        reasons.append(f"Matched {len(matched_keywords)} women/girl-child key term(s): {', '.join(matched_keywords[:5])}")

    # 6. Title specific match boost
    title_lower = title_text.lower()
    title_matches = [kw for kw in (WOMEN_KEYWORDS + DEVANAGARI_WOMEN_KEYWORDS) if kw in title_lower]
    if title_matches:
        confidence_points += 0.15
        reasons.append(f"Scheme title explicitly contains women-targeted term(s): {', '.join(title_matches[:3])}")

    confidence_score = min(1.0, round(confidence_points, 2))
    is_relevant = confidence_score >= 0.20 or bool(matched_keywords)

    if not is_relevant:
        reasons.append("No women-specific keywords, gender tags, or administrative markers identified.")

    return {
        "is_relevant": is_relevant,
        "confidence_score": confidence_score,
        "matched_keywords": matched_keywords,
        "is_male_exclusive": False,
        "reasons": reasons
    }

def is_women_relevant(record: dict) -> bool:
    """
    Women Filter Logic (TDD Section 6.2 / Ticket 2.2):
    Checks whether a scheme is relevant for women using the multi-criteria classifier.
    """
    return classify_women_relevancy(record)["is_relevant"]

def clean_int(val, default=0) -> int:
    """Safely converts a value to integer."""
    if val is None or val == "":
        return default
    try:
        val_str = str(val).replace(",", "").strip()
        return int(float(val_str))
    except (ValueError, TypeError):
        return default

def clean_bool(val, default=False) -> bool:
    """Safely converts a value to boolean."""
    if isinstance(val, bool):
        return val
    if val is None or val == "":
        return default
    val_str = str(val).strip().lower()
    return val_str in ["true", "1", "yes", "t", "y"]

def extract_age_bounds(text: str, default_min: int = 0, default_max: int = 100) -> tuple:
    """
    Extracts numeric minimum and maximum age constraints from narrative eligibility text using regex (Ticket 2.4).
    """
    if not text:
        return default_min, default_max
    
    text_clean = str(text).lower()

    # Pattern 1: aged between X and Y / between X and Y years
    m = re.search(r'(?:aged\s+)?between\s+(\d+)\s+(?:and|to|-)\s+(\d+)\s*(?:years|yrs)?', text_clean)
    if m:
        min_age, max_age = int(m.group(1)), int(m.group(2))
        if min_age <= max_age and max_age <= 120:
            return min_age, max_age

    # Pattern 2: aged X to Y years / aged X-Y years
    m = re.search(r'aged\s+(\d+)\s*(?:to|-)\s*(\d+)\s*(?:years|yrs)?', text_clean)
    if m:
        min_age, max_age = int(m.group(1)), int(m.group(2))
        if min_age <= max_age and max_age <= 120:
            return min_age, max_age

    # Pattern 3: X to Y years of age / X-Y years
    m = re.search(r'(\d+)\s*(?:to|-)\s*(\d+)\s*(?:years|yrs)(?:\s+of\s+age)?', text_clean)
    if m:
        min_age, max_age = int(m.group(1)), int(m.group(2))
        if min_age <= max_age and max_age <= 120:
            return min_age, max_age

    # Pattern 4: aged X+ / X years and above / aged X years or older / aged X and above
    m = re.search(r'(?:aged\s+)?(\d+)\s*(?:years|yrs)?\s*(?:\+|and\s+above|and\s+older|or\s+above|\babove\b|\bolder\b)(?!\s*%)', text_clean)
    if m:
        min_age = int(m.group(1))
        if min_age <= 100:
            return min_age, default_max

    # Pattern 5: at least X years / minimum age of X years
    m = re.search(r'(?:at\s+least|atleast|minimum\s+(?:age\s+(?:of\s+)?)?)\s*(\d+)\s*(?:years|yrs)(?!\s*%)', text_clean)
    if m:
        min_age = int(m.group(1))
        if min_age <= 100:
            return min_age, default_max

    # Pattern 6: below X years / up to X years / under X years
    m = re.search(r'(?:below|up\s+to|upto|under|maximum\s+(?:age\s+(?:of\s+)?)?)\s*(\d+)\s*(?:years|yrs)(?:\s+of\s+age)?(?!\s*%)', text_clean)
    if m:
        max_age = int(m.group(1))
        if max_age <= 120:
            return default_min, max_age

    # Pattern 7: girl child (up to X years)
    m = re.search(r'(?:girl\s+child|age|female)\s*\((?:up\s+to\s+)?(\d+)\s*(?:years|yrs)?\)', text_clean)
    if m:
        max_age = int(m.group(1))
        if max_age <= 120:
            return default_min, max_age

    # Pattern 8: aged below (\d+) years
    m = re.search(r'aged\s+below\s+(\d+)\s*(?:years|yrs)?', text_clean)
    if m:
        max_age = int(m.group(1))
        if max_age <= 120:
            return default_min, max_age

    # Pattern 9: adult woman aged 18+ / aged 18
    m = re.search(r'aged\s+(\d+)\b', text_clean)
    if m:
        min_age = int(m.group(1))
        if 10 <= min_age <= 100:
            return min_age, default_max

    return default_min, default_max

# Content-based adult and pension keyword rules (TICKET-101)
ADULT_ONLY_KEYWORDS = [
    "working women", "working woman", "hostel scheme", "marriage", "vivah", "wedding",
    "kalyanam", "nikah", "shaadi", "shagun", "entrepreneur", "business loan", "mudra",
    "stand up india", "stand-up india", "self help group", "self-help group", "shg",
    "self employment", "swarojgar", "safai karamchari", "loan for", "credit facility",
    "shelter home", "one stop centre", "mahila samman savings", "street vendor",
    "svanidhi", "hawker", "livelihood mission", "swadhar greh", "ujjawala",
    "widow pension", "destitute pension", "divyang pension", "maternity benefit",
    "pmmvy", "janani suraksha", "artisan loan", "handloom weaver loan",
    "micro enterprise", "commercial vehicle loan", "tractor loan"
]

PENSION_KEYWORDS = [
    "old age pension", "vridha pension", "vruddha pension", "senior citizen pension",
    "elderly pension", "vaya vandana", "vridhavastha"
]

def infer_age_bounds_from_content(
    name: str,
    description: str = "",
    eligibility_text: str = "",
    beneficiary_type: str = "",
    life_stage_tags: list = None,
    current_min: int = 0,
    current_max: int = 100
) -> tuple:
    """
    Infers rational age bounds based on scheme name, life stage tags, and semantic keywords (TICKET-101).
    Ensures adult-only schemes and pensions do not have default child-eligible bounds (0-100).
    """
    if life_stage_tags is None:
        life_stage_tags = []

    age_min = current_min
    age_max = current_max

    combined_text = f"{name} {description} {eligibility_text} {beneficiary_type}".lower()
    name_lower = name.lower()

    # 1. Pension Schemes (unless orphan/family pension for minors)
    if any(kw in combined_text for kw in PENSION_KEYWORDS) or ("pension" in name_lower and "widow" not in name_lower and "student" not in combined_text and "orphan" not in combined_text and "family pension" not in combined_text):
        if age_min < 60:
            age_min = 60
        if age_max <= 60:
            age_max = 100
        return age_min, age_max

    # 2. Widow Pensions
    if "widow pension" in combined_text or "vidhwa pension" in combined_text or ("widow" in name_lower and "pension" in combined_text):
        if age_min < 18:
            age_min = 18
        if age_max == 100:
            age_max = 80
        return age_min, age_max

    # 3. Adult-only schemes (Hostels, Marriage, Business loans, SHGs, Mudra, Safai Karamchari)
    if not any(cw in name_lower for cw in ["girl child", "balika", "sukanya", "school", "scholarship"]):
        # Working women hostels
        if "working women" in combined_text or "hostel" in name_lower and "student" not in combined_text:
            if age_min < 18:
                age_min = 18
            if age_max == 100:
                age_max = 60
        # Marriage assistance
        elif any(kw in combined_text for kw in ["marriage", "vivah", "wedding", "kalyanam", "nikah", "shaadi", "shagun"]):
            if age_min < 18:
                age_min = 18
            if age_max == 100:
                age_max = 45
        # Entrepreneur loans / Livelihood / Credit facilities
        elif any(kw in combined_text for kw in ["mudra", "stand up india", "stand-up india", "business loan", "safai karamchari", "street vendor", "svanidhi", "self help group", "self-help group", "swarojgar", "credit facility"]):
            if age_min < 18:
                age_min = 18
            if age_max == 100:
                age_max = 65
        # General adult-only keyword check
        elif age_min < 18 and any(kw in name_lower for kw in ADULT_ONLY_KEYWORDS):
            age_min = 18

    # 4. Life-stage canonical default enforcement when still unconstrained (0, 100)
    if age_min == 0 and age_max == 100:
        if "student" in life_stage_tags:
            age_min, age_max = 5, 30
        elif "maternal" in life_stage_tags:
            age_min, age_max = 18, 50
        elif "senior" in life_stage_tags:
            age_min, age_max = 60, 100
        elif "entrepreneur" in life_stage_tags:
            age_min, age_max = 18, 65

    return age_min, age_max

def extract_income_cap(text: str, default_income: int = 0) -> int:
    """
    Extracts maximum family/annual income cap in INR from narrative eligibility text (Ticket 2.4).
    """
    if not text:
        return default_income

    text_clean = str(text).lower()

    # Pattern 1: annual/family/gross income ... not exceed / below / less than Rs 2,50,000 / Rs 3,00,000
    m = re.search(
        r'(?:annual|family|gross|household)?\s*(?:family\s*)?income\b(?:[a-zA-Z\s,]{0,45}?)(?:must|should)?\s*(?:not\s*exceed|below|under|less\s+than|up\s+to|upto|is\s+less\s+than|ceiling\s+of|limit\s+(?:of\s+)?)?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+)',
        text_clean
    )
    if m:
        val_str = m.group(1).replace(",", "").strip()
        try:
            val = int(val_str)
            if val >= 10000:  # Sensible minimum annual income cap
                return val
        except ValueError:
            pass

    # Pattern 2: income in Lakhs (e.g. Rs 2.5 Lakh / 3 Lakh / 5 Lakh)
    m = re.search(
        r'(?:annual|family|gross)?\s*(?:family\s*)?income\b(?:[a-zA-Z\s,]{0,45}?)(?:must|should)?\s*(?:not\s*exceed|below|under|less\s+than|up\s+to|upto)?\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)',
        text_clean
    )
    if m:
        try:
            val = int(float(m.group(1)) * 100000)
            return val
        except ValueError:
            pass

    # Pattern 3: gross monthly salary does not exceed Rs 50,000 (annualize to 12 * 50,000 = 600,000)
    m = re.search(
        r'monthly\s+(?:salary|income)\s*(?:does\s*not\s*exceed|below|under|less\s+than|up\s+to|upto)?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+)',
        text_clean
    )
    if m:
        val_str = m.group(1).replace(",", "").strip()
        try:
            monthly_val = int(val_str)
            if monthly_val > 0:
                return monthly_val * 12
        except ValueError:
            pass

    return default_income

def extract_caste_categories(text: str) -> list:
    """
    Extracts applicable caste/social categories (SC, ST, OBC, General) from eligibility text (Ticket 2.4).
    Returns ['All'] if universal or unrestricted.
    """
    if not text:
        return ["All"]

    text_clean = str(text).lower()

    if "all categories" in text_clean or "all women" in text_clean or "any caste" in text_clean:
        return ["All"]

    categories = []
    
    # Check SC/ST
    if re.search(r'\bsc\b|\bst\b|scheduled\s+caste|scheduled\s+tribe|sc/st|sc\s+and\s+st', text_clean):
        if "sc" in text_clean or "scheduled caste" in text_clean:
            categories.append("SC")
        if "st" in text_clean or "scheduled tribe" in text_clean:
            categories.append("ST")

    # Check OBC
    if re.search(r'\bobc\b|\bbc\b|backward\s+class|other\s+backward', text_clean):
        if "OBC" not in categories:
            categories.append("OBC")

    # Check General / EWS
    if "general" in text_clean or "all caste" in text_clean or "ews" in text_clean:
        if "General" not in categories:
            categories.append("General")

    categories = sorted(list(set(categories)))
    return categories if categories else ["All"]

def extract_residence_type(text: str) -> str:
    """
    Extracts target residence type (Rural, Urban, or All) from text (Ticket 2.4).
    """
    if not text:
        return "All"
    text_clean = str(text).lower()
    
    is_rural = "rural" in text_clean
    is_urban = "urban" in text_clean or "street vendor" in text_clean or "metro cities" in text_clean

    if is_rural and not is_urban:
        return "Rural"
    elif is_urban and not is_rural:
        return "Urban"
    return "All"

def extract_boolean_flags(text: str) -> dict:
    """
    Extracts boolean eligibility flags (requires_bpl, requires_disability, is_active) (Ticket 2.4).
    """
    if not text:
        return {
            "requires_bpl": False,
            "requires_disability": False,
            "is_active": True
        }

    text_clean = str(text).lower()

    # BPL Indicators
    bpl_keywords = [
        "bpl", "below poverty line", "below the poverty line", "antyodaya", "aay",
        "secc", "yellow ration card", "orange ration card", "pink ration card",
        "food security card", "white ration card", "poor household", "poor families",
        "low-income", "low income", "destitute"
    ]
    requires_bpl = any(kw in text_clean for kw in bpl_keywords)

    # Disability Indicators (only if not an optional alternate clause like 'or disability certificate')
    if "or disability certificate" in text_clean or "or divyang certificate" in text_clean:
        requires_disability = False
    else:
        disability_keywords = [
            "disability", "disabled", "divyang", "specially abled", "handicap", "orthopedic"
        ]
        requires_disability = any(kw in text_clean for kw in disability_keywords)

    return {
        "requires_bpl": requires_bpl,
        "requires_disability": requires_disability,
        "is_active": True
    }

ALL_INDIAN_STATES_LIST = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
    "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", 
    "Chandigarh", "Dadra and Nagar Haveli", "Daman and Diu", "Lakshadweep", "Andaman and Nicobar"
]

def extract_state_from_text(text: str) -> str:
    """Detects Indian state or UT from narrative text."""
    if not text:
        return "All"
    text_clean = text.lower()
    for st in ALL_INDIAN_STATES_LIST:
        pattern = r'\b' + re.escape(st.lower()) + r'\b'
        if re.search(pattern, text_clean):
            return st
    return "All"

def transform_kaggle_myscheme_record(row: dict) -> dict:
    """
    Transforms a raw Kaggle MyScheme CSV record into the BigQuery `schemes_women` data model (Ticket 2.1 & 2.4).
    Maps both exact MyScheme CSV column names and extracts structured constraints from narrative text.
    """
    name = (
        row.get("Scheme Name") or row.get("scheme_name") or
        row.get("name") or row.get("title") or ""
    ).strip()
    
    scheme_id = slugify(name)
    
    level = str(row.get("level") or "").strip().lower()
    
    raw_state = (
        row.get("State") or row.get("state_name") or
        row.get("state") or ""
    ).strip()
    
    details = (
        row.get("Details") or row.get("details") or
        row.get("description") or row.get("summary") or ""
    ).strip()
    
    benefits = (
        row.get("Benefits") or row.get("scheme_benefits") or
        row.get("benefits") or details or "Government welfare entitlement"
    ).strip()

    eligibility_text = (
        row.get("Eligibility") or row.get("eligibility_criteria_text") or
        row.get("eligibility_text") or details or "Resident Indian citizen meeting scheme guidelines"
    ).strip()

    tags = str(row.get("tags") or "").strip()
    
    # State Resolution
    if raw_state and raw_state.lower() not in ["central", "all", "all india", "national", "india", ""]:
        state = raw_state
    elif level == "central":
        state = "All"
    elif level == "state" or not raw_state:
        detected = extract_state_from_text(f"{name} {details} {eligibility_text} {tags}")
        state = detected if detected != "All" else ("All" if level != "state" else "All")
    else:
        state = "All"

    eligible_states = ["All"] if state == "All" else [state]
    description = details if details else benefits

    ministry = (
        row.get("Ministry") or row.get("ministry_name") or
        row.get("ministry") or ("Government of India" if state == "All" else f"Government of {state}")
    ).strip()

    department = (
        row.get("Department") or row.get("department_name") or
        row.get("department") or "Department of Social Welfare"
    ).strip()

    category = (
        row.get("schemeCategory") or row.get("Category") or 
        row.get("scheme_category") or row.get("category") or "Social welfare & Empowerment"
    ).strip()

    beneficiary_type = (
        row.get("Beneficiaries") or row.get("target_beneficiary") or
        row.get("beneficiary_type") or "Women & Girls"
    ).strip()

    documents_required = (
        row.get("documents") or row.get("Documents Required") or 
        row.get("required_documents") or row.get("documents_required") or ""
    ).strip()

    apply_url = (
        row.get("Source URL") or row.get("application_url") or
        row.get("apply_url") or row.get("source_url") or ""
    ).strip()

    application_process = (
        row.get("application") or row.get("Application Process") or 
        row.get("application_process") or
        (f"Apply online at {apply_url} or visit designated nodal office." if apply_url else "Apply through official portal or designated nodal office.")
    ).strip()

    official_url = (
        row.get("official_website") or row.get("official_url") or
        row.get("Source URL") or apply_url
    ).strip()

    life_stage_tags = classify_life_stage(row)

    # Extract structured constraints from narrative eligibility, beneficiary, and details text
    eligibility_narrative = f"{name} {beneficiary_type} {eligibility_text} {details} {benefits} {tags}"

    extracted_min_age, extracted_max_age = extract_age_bounds(eligibility_narrative, default_min=0, default_max=100)
    explicit_min_age = clean_int(row.get("min_age") or row.get("age_min"), 0)
    explicit_max_age = clean_int(row.get("max_age") or row.get("age_max"), 100)
    age_min = explicit_min_age if explicit_min_age > 0 else extracted_min_age
    age_max = explicit_max_age if explicit_max_age < 100 else extracted_max_age

    # Apply content-based and canonical age bounds inference (TICKET-101)
    age_min, age_max = infer_age_bounds_from_content(
        name=name,
        description=description,
        eligibility_text=eligibility_text,
        beneficiary_type=beneficiary_type,
        life_stage_tags=life_stage_tags,
        current_min=age_min,
        current_max=age_max
    )

    extracted_income = extract_income_cap(eligibility_narrative, default_income=0)
    explicit_income = clean_int(row.get("max_income_limit") or row.get("income_max"), 0)
    income_max = explicit_income if explicit_income > 0 else extracted_income

    extracted_caste = extract_caste_categories(eligibility_narrative)
    caste_raw = row.get("caste_category") or row.get("caste_categories")
    if caste_raw:
        if isinstance(caste_raw, list):
            caste_categories = caste_raw
        else:
            c_str = str(caste_raw).strip()
            caste_categories = [c_str] if c_str and c_str != "All" else extracted_caste
    else:
        caste_categories = extracted_caste

    extracted_residence = extract_residence_type(eligibility_narrative)
    residence = str(row.get("residence_type") or row.get("residence") or extracted_residence).strip()

    flags = extract_boolean_flags(eligibility_narrative)
    requires_bpl = clean_bool(row.get("is_bpl_required") or row.get("requires_bpl"), flags["requires_bpl"])
    requires_disability = clean_bool(row.get("is_disability_required") or row.get("requires_disability"), flags["requires_disability"])

    return {
        "scheme_id": scheme_id,
        "name": name,
        "description": description,
        "ministry": ministry,
        "department": department,
        "state": state,
        "category": category,
        "beneficiary_type": beneficiary_type,
        "benefits": benefits,
        "eligibility_text": eligibility_text,
        "documents_required": documents_required,
        "application_process": application_process,
        "apply_url": apply_url,
        "official_url": official_url,
        "age_min": age_min,
        "age_max": age_max,
        "gender": str(row.get("gender") or row.get("gender_applicable") or "Female").strip(),
        "caste_categories": json.dumps(caste_categories),
        "income_max": income_max,
        "residence": residence,
        "eligible_states": json.dumps(eligible_states),
        "requires_bpl": requires_bpl,
        "requires_disability": requires_disability,
        "life_stage_tags": json.dumps(life_stage_tags),
        "is_active": clean_bool(row.get("active_status") or row.get("is_active"), True),
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

def transform_csv_record(row: dict) -> dict:
    """Transforms a raw CSV scheme record into the BigQuery `schemes_women` schema."""
    raw_id = row.get("scheme_id", "").strip()
    name = row.get("scheme_name", "").strip()
    scheme_id = raw_id if raw_id else slugify(name)
    
    life_stage_tags = classify_life_stage(row)
    
    state = row.get("state_name", "All").strip()
    eligible_states_str = row.get("eligible_states_list", state).strip()
    eligible_states = [eligible_states_str] if eligible_states_str and eligible_states_str != "All" else ["All"]

    caste_raw = row.get("caste_category", "All").strip()
    caste_categories = [caste_raw] if caste_raw and caste_raw != "All" else ["All"]

    raw_age_min = clean_int(row.get("min_age"), 0)
    raw_age_max = clean_int(row.get("max_age"), 100)
    extracted_min, extracted_max = extract_age_bounds(f"{name} {row.get('eligibility_criteria_text', '')}", default_min=0, default_max=100)
    eff_min = raw_age_min if raw_age_min > 0 else extracted_min
    eff_max = raw_age_max if raw_age_max < 100 else extracted_max
    age_min, age_max = infer_age_bounds_from_content(
        name=name,
        description=row.get("eligibility_criteria_text", ""),
        eligibility_text=row.get("eligibility_criteria_text", ""),
        beneficiary_type=row.get("target_beneficiary", ""),
        life_stage_tags=life_stage_tags,
        current_min=eff_min,
        current_max=eff_max
    )

    return {
        "scheme_id": scheme_id,
        "name": name,
        "description": row.get("eligibility_criteria_text", row.get("scheme_benefits", "")).strip(),
        "ministry": row.get("ministry_name", "Government of India").strip(),
        "department": row.get("department_name", "Department of Social Welfare").strip(),
        "state": state if state else "All",
        "category": row.get("scheme_category", "Welfare").strip(),
        "beneficiary_type": row.get("target_beneficiary", "Women").strip(),
        "benefits": row.get("scheme_benefits", "").strip(),
        "eligibility_text": row.get("eligibility_criteria_text", "").strip(),
        "documents_required": row.get("required_documents", "").strip(),
        "application_process": f"Apply online at {row.get('application_url', 'official portal')}.",
        "apply_url": row.get("application_url", "").strip(),
        "official_url": row.get("official_website", "").strip(),
        "age_min": age_min,
        "age_max": age_max,
        "gender": row.get("gender_applicable", "Female").strip(),
        "caste_categories": json.dumps(caste_categories),
        "income_max": clean_int(row.get("max_income_limit"), 0),
        "residence": row.get("residence_type", "All").strip(),
        "eligible_states": json.dumps(eligible_states),
        "requires_bpl": clean_bool(row.get("is_bpl_required"), False),
        "requires_disability": clean_bool(row.get("is_disability_required"), False),
        "life_stage_tags": json.dumps(life_stage_tags),
        "is_active": clean_bool(row.get("active_status"), True),
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

def transform_json_record(item: dict) -> dict:
    """Transforms a raw HuggingFace JSON scheme record into the BigQuery `schemes_women` schema."""
    name = item.get("title", "").strip()
    scheme_id = slugify(item.get("hf_id", name))
    
    eligibility = item.get("eligibility", {})
    urls = item.get("urls", {})
    life_stage_tags = classify_life_stage(item)

    raw_age_min = clean_int(eligibility.get("min_age"), 0)
    raw_age_max = clean_int(eligibility.get("max_age"), 100)
    extracted_min, extracted_max = extract_age_bounds(f"{name} {item.get('summary', '')}", default_min=0, default_max=100)
    eff_min = raw_age_min if raw_age_min > 0 else extracted_min
    eff_max = raw_age_max if raw_age_max < 100 else extracted_max
    age_min, age_max = infer_age_bounds_from_content(
        name=name,
        description=item.get("summary", ""),
        eligibility_text=item.get("summary", ""),
        beneficiary_type="Women & Girls",
        life_stage_tags=life_stage_tags,
        current_min=eff_min,
        current_max=eff_max
    )

    return {
        "scheme_id": scheme_id,
        "name": name,
        "description": item.get("summary", "").strip(),
        "ministry": item.get("organization", "Central Government").strip(),
        "department": item.get("domain", "Social Welfare").strip(),
        "state": item.get("geography", "All").strip(),
        "category": item.get("domain", "General Welfare").strip(),
        "beneficiary_type": "Women & Girls",
        "benefits": item.get("benefits_text", "").strip(),
        "eligibility_text": item.get("summary", "").strip(),
        "documents_required": ", ".join(item.get("documents", [])),
        "application_process": f"Submit application via official portal: {urls.get('apply', '')}",
        "apply_url": urls.get("apply", "").strip(),
        "official_url": urls.get("portal", "").strip(),
        "age_min": age_min,
        "age_max": age_max,
        "gender": eligibility.get("gender", "Female"),
        "caste_categories": json.dumps(["All"]),
        "income_max": clean_int(eligibility.get("max_income"), 0),
        "residence": "All",
        "eligible_states": json.dumps(["All"]),
        "requires_bpl": clean_bool(eligibility.get("requires_bpl"), False),
        "requires_disability": clean_bool(eligibility.get("requires_disability"), False),
        "life_stage_tags": json.dumps(life_stage_tags),
        "is_active": True,
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

def normalize_canonical_name(name: str) -> str:
    """Normalizes a scheme name by stripping parenthetical acronyms, non-alphanumeric characters, and whitespace."""
    if not name:
        return ""
    n = name.lower().strip()
    n = re.sub(r'\(.*?\)', '', n)
    n = re.sub(r'[^a-z0-9]', '', n)
    return n

def get_canonical_slug(existing_id: str, incoming_id: str, scheme_name: str) -> str:
    """Determines the most descriptive, canonical slug for a scheme record."""
    standard_slug = slugify(scheme_name)
    if existing_id and incoming_id and existing_id == incoming_id and not existing_id.startswith("hf-scheme-"):
        return existing_id
    candidates = [existing_id, incoming_id, standard_slug]
    valid = [c for c in candidates if c and not c.startswith("hf-scheme-")]
    if standard_slug in valid:
        return standard_slug
    if valid:
        return max(valid, key=len)
    return standard_slug or existing_id or incoming_id

def merge_scheme_records(existing: dict, incoming: dict) -> dict:
    """
    Intelligently merges two scheme records sharing the same scheme_id or canonical name (Ticket 1.1 / 3.1).
    Applies field-specific conflict resolution rules:
      - Canonical Slug: selects cleanest, descriptive slug.
      - Narratives: selects longer, more comprehensive text.
      - Ministry/Department/Category: prefers specific names over generic defaults.
      - URLs: prefers valid HTTPS/HTTP URLs over empty/placeholder strings.
      - Tags & Lists: unions life_stage_tags and caste_categories; deduplicates eligible_states.
      - Bounds: preserves tightest valid age and income caps.
      - Booleans: applies logical OR for welfare constraints (requires_bpl, requires_disability).
    """
    merged = dict(existing)

    # 1. Names and Core Identifiers
    if not merged.get("name") and incoming.get("name"):
        merged["name"] = incoming["name"]

    merged["scheme_id"] = get_canonical_slug(
        existing.get("scheme_id", ""),
        incoming.get("scheme_id", ""),
        merged.get("name", "")
    )

    # 2. Narrative Fields (Prefer longer, more informative content)
    narrative_fields = [
        "description", "eligibility_text", "benefits",
        "documents_required", "application_process"
    ]
    for field in narrative_fields:
        ex_val = str(existing.get(field) or "").strip()
        inc_val = str(incoming.get(field) or "").strip()
        if len(inc_val) > len(ex_val):
            merged[field] = inc_val
        else:
            merged[field] = ex_val

    # 3. Ministry, Department, Category, Beneficiary Type (Prefer specific over generic defaults)
    generic_values = {
        "government of india", "central government", "department of social welfare",
        "social welfare & empowerment", "general welfare", "welfare",
        "women & girls", "women", "all", ""
    }
    org_fields = ["ministry", "department", "category", "beneficiary_type"]
    for field in org_fields:
        ex_val = str(existing.get(field) or "").strip()
        inc_val = str(incoming.get(field) or "").strip()
        ex_is_generic = ex_val.lower() in generic_values
        inc_is_generic = inc_val.lower() in generic_values

        if ex_is_generic and not inc_is_generic:
            merged[field] = inc_val
        elif not ex_is_generic and inc_is_generic:
            merged[field] = ex_val
        else:
            # Both specific or both generic: pick longer string
            merged[field] = inc_val if len(inc_val) > len(ex_val) else ex_val

    # 4. URLs (Prefer valid http/https URLs)
    url_fields = ["apply_url", "official_url"]
    for field in url_fields:
        ex_url = str(existing.get(field) or "").strip()
        inc_url = str(incoming.get(field) or "").strip()
        ex_valid = ex_url.startswith("http://") or ex_url.startswith("https://")
        inc_valid = inc_url.startswith("http://") or inc_url.startswith("https://")

        if not ex_valid and inc_valid:
            merged[field] = inc_url
        elif ex_valid and not inc_valid:
            merged[field] = ex_url
        elif inc_valid and ex_valid:
            merged[field] = inc_url if len(inc_url) > len(ex_url) else ex_url
        else:
            merged[field] = inc_url or ex_url

    # 5. Geography & States
    ex_state = str(existing.get("state") or "All").strip()
    inc_state = str(incoming.get("state") or "All").strip()
    if ex_state.lower() in ["all", "central"] and inc_state.lower() not in ["all", "central", ""]:
        merged["state"] = inc_state
    else:
        merged["state"] = ex_state

    # Eligible states list union
    try:
        ex_states = json.loads(existing.get("eligible_states", '["All"]')) if isinstance(existing.get("eligible_states"), str) else existing.get("eligible_states", ["All"])
    except Exception:
        ex_states = ["All"]
    try:
        inc_states = json.loads(incoming.get("eligible_states", '["All"]')) if isinstance(incoming.get("eligible_states"), str) else incoming.get("eligible_states", ["All"])
    except Exception:
        inc_states = ["All"]
    
    combined_states = list(set([s for s in ex_states + inc_states if s and s != "All"]))
    merged["eligible_states"] = json.dumps(combined_states if combined_states else ["All"])

    # 6. Caste Categories Union
    try:
        ex_caste = json.loads(existing.get("caste_categories", '["All"]')) if isinstance(existing.get("caste_categories"), str) else existing.get("caste_categories", ["All"])
    except Exception:
        ex_caste = ["All"]
    try:
        inc_caste = json.loads(incoming.get("caste_categories", '["All"]')) if isinstance(incoming.get("caste_categories"), str) else incoming.get("caste_categories", ["All"])
    except Exception:
        inc_caste = ["All"]
    
    if ex_caste == ["All"] and inc_caste != ["All"]:
        final_caste = inc_caste
    elif inc_caste == ["All"] and ex_caste != ["All"]:
        final_caste = ex_caste
    elif ex_caste == ["All"] and inc_caste == ["All"]:
        final_caste = ["All"]
    else:
        final_caste = sorted(list(set(ex_caste + inc_caste)))
    merged["caste_categories"] = json.dumps(final_caste)

    # 7. Life Stage Tags Union
    try:
        ex_tags = json.loads(existing.get("life_stage_tags", '["general"]')) if isinstance(existing.get("life_stage_tags"), str) else existing.get("life_stage_tags", ["general"])
    except Exception:
        ex_tags = ["general"]
    try:
        inc_tags = json.loads(incoming.get("life_stage_tags", '["general"]')) if isinstance(incoming.get("life_stage_tags"), str) else incoming.get("life_stage_tags", ["general"])
    except Exception:
        inc_tags = ["general"]

    combined_tags = sorted(list(set([t for t in ex_tags + inc_tags if t in CANONICAL_LIFE_STAGES])))
    if not combined_tags:
        combined_tags = ["general"]
    merged["life_stage_tags"] = json.dumps(combined_tags)

    # 8. Age Bounds (Tighter bound reconciliation)
    ex_min = clean_int(existing.get("age_min"), 0)
    inc_min = clean_int(incoming.get("age_min"), 0)
    ex_max = clean_int(existing.get("age_max"), 100)
    inc_max = clean_int(incoming.get("age_max"), 100)

    # Min age: tighter is higher non-zero
    if ex_min > 0 and inc_min > 0:
        new_min = max(ex_min, inc_min)
    else:
        new_min = ex_min if ex_min > 0 else inc_min

    # Max age: tighter is lower non-default
    if ex_max < 100 and inc_max < 100:
        new_max = min(ex_max, inc_max)
    else:
        new_max = ex_max if ex_max < 100 else inc_max

    if new_min <= new_max:
        merged["age_min"] = new_min
        merged["age_max"] = new_max
    else:
        merged["age_min"] = ex_min
        merged["age_max"] = ex_max

    # 9. Income Cap (Tighter bound reconciliation)
    ex_inc = clean_int(existing.get("income_max"), 0)
    inc_inc = clean_int(incoming.get("income_max"), 0)
    if ex_inc > 0 and inc_inc > 0:
        merged["income_max"] = min(ex_inc, inc_inc)
    else:
        merged["income_max"] = ex_inc if ex_inc > 0 else inc_inc

    # 10. Residence Type
    ex_res = str(existing.get("residence") or "All").strip()
    inc_res = str(incoming.get("residence") or "All").strip()
    if ex_res.lower() == "all" and inc_res.lower() in ["rural", "urban"]:
        merged["residence"] = inc_res
    else:
        merged["residence"] = ex_res

    # 11. Boolean Flags (Logical OR for eligibility requirements)
    merged["requires_bpl"] = clean_bool(existing.get("requires_bpl"), False) or clean_bool(incoming.get("requires_bpl"), False)
    merged["requires_disability"] = clean_bool(existing.get("requires_disability"), False) or clean_bool(incoming.get("requires_disability"), False)
    merged["is_active"] = clean_bool(existing.get("is_active", True), True) and clean_bool(incoming.get("is_active", True), True)

    # 12. Timestamp
    merged["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    return merged

def merge_and_deduplicate_schemes(records: list) -> list:
    """
    Deduplicates a list of transformed scheme records by canonical name normalization
    and scheme_id, applying intelligent field conflict resolution via merge_scheme_records (Ticket 1.1).
    """
    schemes_by_key = {}
    collision_count = 0

    for rec in records:
        sid = str(rec.get("scheme_id", "")).strip()
        name = str(rec.get("name", "")).strip()
        if not sid and not name:
            continue

        norm_name = normalize_canonical_name(name)
        primary_key = norm_name if norm_name else sid

        if primary_key not in schemes_by_key:
            schemes_by_key[primary_key] = rec
        else:
            schemes_by_key[primary_key] = merge_scheme_records(schemes_by_key[primary_key], rec)
            collision_count += 1

    # Secondary resolution: ensure unique scheme_ids among all deduplicated records
    schemes_by_id = {}
    for rec in schemes_by_key.values():
        rec_id = rec.get("scheme_id")
        if rec_id not in schemes_by_id:
            schemes_by_id[rec_id] = rec
        else:
            schemes_by_id[rec_id] = merge_scheme_records(schemes_by_id[rec_id], rec)
            collision_count += 1

    # Enforce audited scheme age bounds and keyword inference (Ticket YD-DATA-2.1 / TICKET-101)
    for rec in schemes_by_id.values():
        rec_id = rec.get("scheme_id")
        if rec_id in SCHEME_EXPLICIT_AGE_BOUNDS:
            rec["age_min"], rec["age_max"] = SCHEME_EXPLICIT_AGE_BOUNDS[rec_id]
        else:
            # Secondary pass: infer age bounds if still defaulted or inconsistent
            cur_min = clean_int(rec.get("age_min"), 0)
            cur_max = clean_int(rec.get("age_max"), 100)
            life_tags = []
            raw_tags = rec.get("life_stage_tags", "[]")
            if isinstance(raw_tags, str):
                try:
                    life_tags = json.loads(raw_tags)
                except Exception:
                    life_tags = []
            elif isinstance(raw_tags, list):
                life_tags = raw_tags

            new_min, new_max = infer_age_bounds_from_content(
                name=rec.get("name", ""),
                description=rec.get("description", ""),
                eligibility_text=rec.get("eligibility_text", ""),
                beneficiary_type=rec.get("beneficiary_type", ""),
                life_stage_tags=life_tags,
                current_min=cur_min,
                current_max=cur_max
            )
            rec["age_min"] = new_min
            rec["age_max"] = new_max

    deduplicated = sorted(list(schemes_by_id.values()), key=lambda x: x.get("name", ""))
    print(f"✓ Deduplicated {len(records)} records into {len(deduplicated)} unique schemes ({collision_count} merge collision(s) resolved)")
    return deduplicated

def load_raw_data() -> list:
    """Reads raw datasets from local data/raw/ directory."""
    raw_records = []
    
    # 1. Load Kaggle MyScheme CSV (Ticket 2.1)
    kaggle_csv_path = os.path.join(DATA_RAW_DIR, "kaggle_myscheme_schemes.csv")
    if os.path.exists(kaggle_csv_path):
        with open(kaggle_csv_path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                transformed = transform_kaggle_myscheme_record(row)
                raw_records.append((row, transformed))
                count += 1
        print(f"✓ Loaded {count} records from raw Kaggle MyScheme CSV: {kaggle_csv_path}")
    else:
        print(f"⚠ Warning: Kaggle raw CSV file not found at {kaggle_csv_path}")

    # 2. Load Legacy CSV raw
    csv_path = os.path.join(DATA_RAW_DIR, "indian_government_schemes_2025.csv")
    if os.path.exists(csv_path):
        with open(csv_path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                transformed = transform_csv_record(row)
                raw_records.append((row, transformed))
                count += 1
        print(f"✓ Loaded {count} records from raw CSV: {csv_path}")
    else:
        print(f"⚠ Warning: Raw CSV file not found at {csv_path}")

    # 3. Load JSON raw
    json_path = os.path.join(DATA_RAW_DIR, "huggingface_welfare_schemes.json")
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            items = json.load(f)
            for item in items:
                transformed = transform_json_record(item)
                raw_records.append((item, transformed))
        print(f"✓ Loaded {len(items)} records from raw JSON: {json_path}")
    else:
        print(f"⚠ Warning: Raw JSON file not found at {json_path}")

    return raw_records

def main():
    print("==================================================")
    print("Yojana Dvar — Ticket 3.1 Deduplication & Ingestion Pipeline")
    print("==================================================")
    
    os.makedirs(DATA_PROCESSED_DIR, exist_ok=True)
    
    raw_pairs = load_raw_data()
    total_raw = len(raw_pairs)
    print(f"Total raw records loaded: {total_raw}")
    
    # Filter for Women relevance
    relevant_schemes = []
    filtered_out_count = 0
    classification_diagnostics = []
    
    for raw_item, transformed in raw_pairs:
        raw_res = classify_women_relevancy(raw_item)
        trans_res = classify_women_relevancy(transformed)
        
        is_rel = raw_res["is_relevant"] or trans_res["is_relevant"]
        best_res = raw_res if raw_res["confidence_score"] >= trans_res["confidence_score"] else trans_res

        if is_rel:
            relevant_schemes.append(transformed)
            classification_diagnostics.append((transformed["name"], best_res))
        else:
            filtered_out_count += 1
            
    # Deduplicate and merge conflicts (Ticket 3.1)
    final_schemes = merge_and_deduplicate_schemes(relevant_schemes)
    
    print("\nETL Execution Summary:")
    print(f"  - Total Raw Input Records:     {total_raw}")
    print(f"  - Filtered Non-Women Schemes:  {filtered_out_count}")
    print(f"  - Relevant Women Records:      {len(relevant_schemes)}")
    print(f"  - Deduplicated Final Catalog:  {len(final_schemes)}")
    if classification_diagnostics:
        avg_conf = round(sum(d[1]["confidence_score"] for d in classification_diagnostics) / len(classification_diagnostics), 2)
        print(f"  - Avg Relevancy Confidence:    {avg_conf * 100:.1f}%")

    # Life Stage Distribution
    stage_counts = {s: 0 for s in CANONICAL_LIFE_STAGES}
    for scheme in final_schemes:
        try:
            tags = json.loads(scheme.get("life_stage_tags", "[]"))
            for t in tags:
                if t in stage_counts:
                    stage_counts[t] += 1
        except Exception:
            pass
    print("\n  Life-Stage Breakdown:")
    for s, c in stage_counts.items():
        print(f"    - {s.capitalize():<14}: {c} scheme(s)")
    
    # Save to data/processed/schemes_women.json
    out_json_path = os.path.join(DATA_PROCESSED_DIR, "schemes_women.json")
    with open(out_json_path, "w", encoding="utf-8") as f:
        json.dump(final_schemes, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Saved processed JSON catalog: {out_json_path}")

    # Synchronize to backend/data/processed/schemes_women.json (Ticket 4.1)
    backend_json_path = os.path.join(BASE_DIR, "backend", "data", "processed", "schemes_women.json")
    os.makedirs(os.path.dirname(backend_json_path), exist_ok=True)
    with open(backend_json_path, "w", encoding="utf-8") as f:
        json.dump(final_schemes, f, indent=2, ensure_ascii=False)
    print(f"✓ Synchronized backend catalog cache: {backend_json_path}")

    # Save to data/processed/schemes_women.csv
    out_csv_path = os.path.join(DATA_PROCESSED_DIR, "schemes_women.csv")
    if final_schemes:
        fieldnames = list(final_schemes[0].keys())
        with open(out_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(final_schemes)
        print(f"✓ Saved processed CSV catalog:  {out_csv_path}")

    # Save to data/processed/schemes_women.ndjson
    out_ndjson_path = os.path.join(DATA_PROCESSED_DIR, "schemes_women.ndjson")
    with open(out_ndjson_path, "w", encoding="utf-8") as f:
        for s in final_schemes:
            f.write(json.dumps(s, ensure_ascii=False) + "\n")
    print(f"✓ Saved processed NDJSON catalog: {out_ndjson_path}")

    print("==================================================")
    print("✓ Ticket 4.1 Synchronized Catalog & ETL Complete!")
    print("==================================================")

if __name__ == "__main__":
    main()
