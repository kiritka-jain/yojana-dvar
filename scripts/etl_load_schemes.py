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

# Women Filter Keywords (Section 6.2)
WOMEN_KEYWORDS = [
    "women", "woman", "girl", "mahila", "matru", "sukanya", "widow",
    "stand-up", "kanya", "ladli", "maternal", "mother", "penn", "sakhi",
    "female", "she", "daughter", "nari", "balika", "pregnant", "lactating"
]

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

def is_women_relevant(record: dict) -> bool:
    """
    Women Filter Logic (TDD Section 6.2):
    Checks whether a scheme is relevant for women based on gender applicability
    or presence of women-centric keywords in title, category, or beneficiary text.
    """
    gender = str(record.get("gender", record.get("gender_applicable", ""))).lower().strip()
    if gender in ["female", "women"]:
        return True
        
    searchable_text = " ".join([
        str(record.get("name", record.get("scheme_name", record.get("title", "")))),
        str(record.get("category", record.get("scheme_category", record.get("domain", "")))),
        str(record.get("beneficiary_type", record.get("target_beneficiary", ""))),
        str(record.get("description", record.get("summary", ""))),
        str(record.get("eligibility_text", record.get("eligibility_criteria_text", "")))
    ]).lower()
    
    return any(keyword in searchable_text for keyword in WOMEN_KEYWORDS)

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

def transform_csv_record(row: dict) -> dict:
    """Transforms a raw CSV scheme record into the BigQuery `schemes_women` schema."""
    raw_id = row.get("scheme_id", "").strip()
    name = row.get("scheme_name", "").strip()
    scheme_id = raw_id if raw_id else slugify(name)
    
    life_stage_raw = row.get("life_stage", "general").strip().lower()
    life_stage_tags = [life_stage_raw] if life_stage_raw else ["general"]
    
    state = row.get("state_name", "All").strip()
    eligible_states_str = row.get("eligible_states_list", state).strip()
    eligible_states = [eligible_states_str] if eligible_states_str and eligible_states_str != "All" else ["All"]

    caste_raw = row.get("caste_category", "All").strip()
    caste_categories = [caste_raw] if caste_raw and caste_raw != "All" else ["All"]

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
        "age_min": clean_int(row.get("min_age"), 0),
        "age_max": clean_int(row.get("max_age"), 100),
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
    tags = item.get("tags", ["general"])

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
        "age_min": clean_int(eligibility.get("min_age"), 0),
        "age_max": clean_int(eligibility.get("max_age"), 100),
        "gender": eligibility.get("gender", "Female"),
        "caste_categories": json.dumps(["All"]),
        "income_max": clean_int(eligibility.get("max_income"), 0),
        "residence": "All",
        "eligible_states": json.dumps(["All"]),
        "requires_bpl": clean_bool(eligibility.get("requires_bpl"), False),
        "requires_disability": clean_bool(eligibility.get("requires_disability"), False),
        "life_stage_tags": json.dumps(tags),
        "is_active": True,
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

def load_raw_data() -> list:
    """Reads raw datasets from local data/raw/ directory."""
    raw_records = []
    
    # 1. Load CSV raw
    csv_path = os.path.join(DATA_RAW_DIR, "indian_government_schemes_2025.csv")
    if os.path.exists(csv_path):
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                transformed = transform_csv_record(row)
                raw_records.append((row, transformed))
                count += 1
        print(f"✓ Loaded {count} records from raw CSV: {csv_path}")
    else:
        print(f"⚠ Warning: Raw CSV file not found at {csv_path}")

    # 2. Load JSON raw
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
    print("Yojana Dvar — Ticket 2.2 ETL Ingestion Pipeline")
    print("==================================================")
    
    os.makedirs(DATA_PROCESSED_DIR, exist_ok=True)
    
    raw_pairs = load_raw_data()
    total_raw = len(raw_pairs)
    print(f"Total raw records loaded: {total_raw}")
    
    # Filter for Women relevance & Deduplicate
    women_schemes_map = {}
    filtered_out_count = 0
    
    for raw_item, transformed in raw_pairs:
        if is_women_relevant(raw_item) or is_women_relevant(transformed):
            scheme_id = transformed["scheme_id"]
            if scheme_id not in women_schemes_map or len(transformed["description"]) > len(women_schemes_map[scheme_id]["description"]):
                women_schemes_map[scheme_id] = transformed
        else:
            filtered_out_count += 1
            
    final_schemes = list(women_schemes_map.values())
    
    print("\nETL Execution Summary:")
    print(f"  - Total Raw Input Records:     {total_raw}")
    print(f"  - Filtered Non-Women Schemes:  {filtered_out_count}")
    print(f"  - Deduplicated Women Catalog:  {len(final_schemes)}")
    
    # Save to data/processed/schemes_women.json
    out_json_path = os.path.join(DATA_PROCESSED_DIR, "schemes_women.json")
    with open(out_json_path, "w", encoding="utf-8") as f:
        json.dump(final_schemes, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Saved processed JSON catalog: {out_json_path}")

    # Save to data/processed/schemes_women.csv
    out_csv_path = os.path.join(DATA_PROCESSED_DIR, "schemes_women.csv")
    if final_schemes:
        fieldnames = list(final_schemes[0].keys())
        with open(out_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(final_schemes)
        print(f"✓ Saved processed CSV catalog:  {out_csv_path}")

    print("==================================================")
    print("✓ Ticket 2.2 ETL Ingestion Pipeline Complete!")
    print("==================================================")

if __name__ == "__main__":
    main()
