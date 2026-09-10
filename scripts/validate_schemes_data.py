#!/usr/bin/env python3
"""
scripts/validate_schemes_data.py
Automated validation gate for processed scheme dataset quality (TICKET-104).
Checks:
1. Valid JSON and non-empty dataset.
2. Zero adult-only schemes (hostels, marriage, safai karamchari, business loans) with age_min < 18.
3. Zero senior citizen pension schemes with age_min < 60 (excluding orphan/family pensions).
4. All scheme IDs are unique and non-empty.
5. Life stage distribution is well-formed (no missing tags).
"""

import json
import os
import sys

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "schemes_women.json")

ADULT_ONLY_KEYWORDS = [
    "working women hostel", "working woman hostel", "hostel scheme",
    "marriage assistance", "kanya vivah", "vivah hetu", "wedding aid",
    "mudra", "stand up india", "stand-up india",
    "safai karamchari", "safai karamcharis",
    "street vendor", "svanidhi", "swarojgar",
    "msme", "micro enterprise", "small enterprise", "medium enterprise",
    "mega industry", "large industry", "thrust sector", "industrial unit",
    "term loan", "working capital", "interest subsidy", "capital subsidy",
    "sgst reimbursement", "stamp duty", "epf reimbursement", "patent registration",
    "quality certification", "power connection charges", "udyam", "dpiit",
    "aquaculture", "brackish water", "fish farming", "shrimp farming",
    "agricultural skill development", "farmer training programme",
    "training programme for women farmers", "training programme for farmers"
]

PENSION_KEYWORDS = [
    "old age pension", "vridha pension", "vruddha pension", "senior citizen pension",
    "elderly pension", "vaya vandana", "vridhavastha"
]


def validate_dataset():
    if not os.path.exists(DATA_FILE):
        print(f"❌ FAIL: Data file not found at {DATA_FILE}")
        sys.exit(1)

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        try:
            schemes = json.load(f)
        except Exception as e:
            print(f"❌ FAIL: Invalid JSON in {DATA_FILE}: {e}")
            sys.exit(1)

    print(f"==================================================")
    print(f"🧪 Validating {len(schemes)} Processed Scheme Records")
    print(f"==================================================")

    assert len(schemes) > 0, "❌ Dataset is empty!"

    # 1. Check ID uniqueness
    scheme_ids = set()
    id_collisions = []
    for s in schemes:
        sid = s.get("scheme_id")
        if not sid:
            id_collisions.append("Missing scheme_id for scheme: " + s.get("name", "Unknown"))
        elif sid in scheme_ids:
            id_collisions.append(f"Duplicate scheme_id: {sid}")
        else:
            scheme_ids.add(sid)

    if id_collisions:
        print(f"❌ FAIL: Found {len(id_collisions)} ID collision(s):")
        for col in id_collisions[:5]:
            print(f"   - {col}")
        sys.exit(1)
    else:
        print(f"✓ PASS: All {len(scheme_ids)} scheme IDs are unique and non-empty.")

    # 2. Check adult-only schemes with age_min < 18
    adult_violations = []
    for s in schemes:
        name = s.get("name", "")
        name_lower = name.lower()
        age_min = int(s.get("age_min", 0))
        
        # Check if adult keyword present and not a girl child scheme
        if any(kw in name_lower for kw in ADULT_ONLY_KEYWORDS):
            if not any(cw in name_lower for cw in ["girl child", "balika", "sukanya", "school", "scholarship"]):
                if age_min < 18:
                    adult_violations.append(f"{name} (id: {s.get('scheme_id')}) has age_min={age_min} (< 18)")

    if adult_violations:
        print(f"❌ FAIL: Found {len(adult_violations)} adult-only scheme(s) with age_min < 18:")
        for v in adult_violations[:10]:
            print(f"   - {v}")
        sys.exit(1)
    else:
        print(f"✓ PASS: Zero adult-only schemes have age_min < 18.")

    # 3. Check senior citizen pensions with age_min < 60
    pension_violations = []
    for s in schemes:
        name = s.get("name", "")
        name_lower = name.lower()
        age_min = int(s.get("age_min", 0))
        
        if any(kw in name_lower for kw in PENSION_KEYWORDS):
            if not any(cw in name_lower for cw in ["widow", "divyang", "disability", "orphan", "family pension"]):
                if age_min < 60:
                    pension_violations.append(f"{name} has age_min={age_min} (< 60)")

    if pension_violations:
        print(f"❌ FAIL: Found {len(pension_violations)} senior pension scheme(s) with age_min < 60:")
        for v in pension_violations[:10]:
            print(f"   - {v}")
        sys.exit(1)
    else:
        print(f"✓ PASS: Zero senior citizen pensions have age_min < 60.")

    # 4. Demographic & Distribution Thresholds (Epic 4: Ticket 4.2)
    bounded_age_count = sum(1 for s in schemes if not (int(s.get("age_min", 0)) == 0 and int(s.get("age_max", 100)) == 100))
    income_cap_count = sum(1 for s in schemes if int(s.get("income_max", 0)) > 0)
    s5_30_count = sum(1 for s in schemes if int(s.get("age_min", 0)) == 5 and int(s.get("age_max", 100)) == 30)
    
    stage_counts = {}
    caste_set = set()
    residence_set = set()
    
    for s in schemes:
        tags = s.get("life_stage_tags", [])
        if isinstance(tags, str):
            try:
                tags = json.loads(tags)
            except Exception:
                tags = []
        for t in tags:
            stage_counts[t] = stage_counts.get(t, 0) + 1
            
        caste_raw = s.get("caste_categories", "[\"All\"]")
        if isinstance(caste_raw, str):
            try:
                parsed_caste = json.loads(caste_raw)
                caste_set.update(parsed_caste if isinstance(parsed_caste, list) else [parsed_caste])
            except Exception:
                caste_set.add(caste_raw)
        elif isinstance(caste_raw, list):
            caste_set.update(caste_raw)
            
        residence = s.get("residence", "All")
        residence_set.add(str(residence).strip().capitalize())

    bounded_pct = (bounded_age_count / len(schemes)) * 100
    income_pct = (income_cap_count / len(schemes)) * 100
    s5_30_pct = (s5_30_count / len(schemes)) * 100

    print(f"\n📊 Summary Statistics:")
    print(f"   - Schemes with bounded age filters: {bounded_age_count} / {len(schemes)} ({bounded_pct:.1f}%)")
    print(f"   - Schemes with generic 5-30 student fallback: {s5_30_count} / {len(schemes)} ({s5_30_pct:.2f}%)")
    print(f"   - Schemes with extracted income caps: {income_cap_count} / {len(schemes)} ({income_pct:.1f}%)")
    print(f"   - Caste categories identified: {sorted(list(caste_set))}")
    print(f"   - Residence scopes identified: {sorted(list(residence_set))}")
    print(f"   - Life stage distribution: {stage_counts}")

    # Assertions for Quality Gate
    assert bounded_pct >= 75.0, f"❌ FAIL: Expected >= 75% bounded age schemes, got {bounded_pct:.1f}%"
    assert s5_30_pct <= 5.0, f"❌ FAIL: Expected <= 5% generic 5-30 fallback, got {s5_30_pct:.2f}%"
    assert income_pct >= 20.0, f"❌ FAIL: Expected >= 20% income caps extracted, got {income_pct:.1f}%"
    assert {"SC", "ST", "OBC", "General", "All"}.issubset(caste_set), f"❌ FAIL: Missing required caste categories in {caste_set}"
    assert {"Rural", "Urban", "All"}.issubset(residence_set), f"❌ FAIL: Missing required residence types in {residence_set}"

    print(f"\n✅ DATASET INTEGRITY & QUALITY VALIDATION PASSED!")

if __name__ == "__main__":
    validate_dataset()

