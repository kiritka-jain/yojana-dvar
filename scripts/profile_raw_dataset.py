#!/usr/bin/env python3
"""
Raw Dataset Schema Profiling & Data Quality Audit Script (Ticket 1.2)
===================================================================
Inspects and profiles raw datasets (e.g., data/raw/kaggle_myscheme_schemes.csv),
analyzes column nullability, unique ministries/departments, central vs. state
distributions, text length statistics, and generates a data quality report.

Usage:
  python3 scripts/profile_raw_dataset.py
  python3 scripts/profile_raw_dataset.py --file data/raw/kaggle_myscheme_schemes.csv
"""

import argparse
import csv
import json
import os
import sys
from collections import Counter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_RAW_CSV = os.path.join(BASE_DIR, "data", "raw", "kaggle_myscheme_schemes.csv")
DEFAULT_REPORT_JSON = os.path.join(BASE_DIR, "data", "raw", "kaggle_raw_profile_report.json")


def profile_csv_dataset(csv_path: str) -> dict:
    if not os.path.isfile(csv_path):
        raise FileNotFoundError(f"Target CSV file not found: {csv_path}")

    with open(csv_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        rows = list(reader)

    total_records = len(rows)
    if total_records == 0:
        return {
            "file_path": csv_path,
            "total_records": 0,
            "total_columns": len(headers),
            "columns": headers,
            "error": "Dataset is empty"
        }

    # Profile column completeness & text stats
    column_stats = {}
    for col in headers:
        values = [r.get(col, "").strip() for r in rows]
        non_empty = [v for v in values if v != "" and v.lower() != "null" and v.lower() != "none"]
        non_empty_count = len(non_empty)
        completeness_pct = round((non_empty_count / total_records) * 100, 2)
        lengths = [len(v) for v in non_empty]
        avg_len = round(sum(lengths) / len(lengths), 1) if lengths else 0
        min_len = min(lengths) if lengths else 0
        max_len = max(lengths) if lengths else 0

        column_stats[col] = {
            "populated_count": non_empty_count,
            "missing_count": total_records - non_empty_count,
            "completeness_pct": completeness_pct,
            "avg_length": avg_len,
            "min_length": min_len,
            "max_length": max_len,
            "sample_value": non_empty[0] if non_empty else ""
        }

    # State distribution (check 'State', 'state_name', 'Level', etc.)
    state_col = next((c for c in headers if c.lower() in ["state", "state_name", "level", "state/ut"]), None)
    state_counts = {}
    central_count = 0
    state_level_count = 0
    if state_col:
        raw_states = [r.get(state_col, "").strip() for r in rows]
        state_counts = dict(Counter(raw_states).most_common())
        central_count = sum(count for state, count in state_counts.items() if state.lower() in ["central", "all", "all india", "national"])
        state_level_count = total_records - central_count

    # Ministry distribution
    ministry_col = next((c for c in headers if c.lower() in ["ministry", "ministry_name", "nodal_ministry"]), None)
    ministry_counts = {}
    if ministry_col:
        raw_ministries = [r.get(ministry_col, "").strip() for r in rows if r.get(ministry_col, "").strip()]
        ministry_counts = dict(Counter(raw_ministries).most_common(15))

    # Category distribution
    cat_col = next((c for c in headers if c.lower() in ["category", "scheme_category", "domain"]), None)
    cat_counts = {}
    if cat_col:
        raw_cats = [r.get(cat_col, "").strip() for r in rows if r.get(cat_col, "").strip()]
        cat_counts = dict(Counter(raw_cats).most_common(15))

    # Key entity checks for women / target groups
    beneficiary_col = next((c for c in headers if c.lower() in ["beneficiaries", "target_beneficiary", "beneficiary_type"]), None)
    eligibility_col = next((c for c in headers if c.lower() in ["eligibility", "eligibility_criteria_text", "eligibility_criteria"]), None)
    
    women_keywords = ["women", "woman", "girl", "mahila", "matru", "sukanya", "widow", "kanya", "female", "nari", "balika", "pregnant", "lactating", "shg", "mother"]
    women_relevant_count = 0
    for r in rows:
        combined_text = " ".join([str(v) for v in r.values()]).lower()
        if any(kw in combined_text for kw in women_keywords):
            women_relevant_count += 1

    profile_result = {
        "file_path": csv_path,
        "file_size_bytes": os.path.getsize(csv_path),
        "total_records": total_records,
        "total_columns": len(headers),
        "columns": headers,
        "column_stats": column_stats,
        "geographic_breakdown": {
            "central_schemes_count": central_count,
            "state_specific_schemes_count": state_level_count,
            "unique_states_count": len(state_counts),
            "state_distribution": state_counts
        },
        "ministry_distribution_top": ministry_counts,
        "category_distribution": cat_counts,
        "women_relevant_records_estimate": {
            "count": women_relevant_count,
            "percentage": round((women_relevant_count / total_records) * 100, 2)
        }
    }

    return profile_result


def print_profile_report(report: dict):
    print("================================================================================")
    print("📊 YOJANA DVAR — RAW DATASET SCHEMA PROFILING & QUALITY AUDIT (Ticket 1.2)")
    print("================================================================================")
    print(f"Dataset File:    {report['file_path']}")
    print(f"File Size:       {report.get('file_size_bytes', 0):,} bytes")
    print(f"Total Records:   {report['total_records']}")
    print(f"Total Columns:   {report['total_columns']}")
    print(f"Women-Targeted:  {report['women_relevant_records_estimate']['count']} / {report['total_records']} ({report['women_relevant_records_estimate']['percentage']}%)")
    print("--------------------------------------------------------------------------------")
    print("1. COLUMN COMPLETENESS & PROFILE")
    print("--------------------------------------------------------------------------------")
    print(f"{'Column Name':<25} | {'Populated':<10} | {'Completeness':<12} | {'Avg Chars':<10} | {'Sample Value'}")
    print("-" * 80)
    for col, stat in report["column_stats"].items():
        sample = stat['sample_value']
        if len(sample) > 25:
            sample = sample[:22] + "..."
        print(f"{col:<25} | {stat['populated_count']:<10} | {stat['completeness_pct']:>9.1f}%  | {stat['avg_length']:>9.1f} | {sample}")

    print("\n--------------------------------------------------------------------------------")
    print("2. GEOGRAPHIC DISTRIBUTION (Central vs States/UTs)")
    print("--------------------------------------------------------------------------------")
    geo = report["geographic_breakdown"]
    print(f"Central Schemes:        {geo['central_schemes_count']}")
    print(f"State-Specific Schemes: {geo['state_specific_schemes_count']}")
    print(f"Unique States/UTs:      {geo['unique_states_count']}")
    print("\nState Breakdown (Top 10):")
    for state, count in list(geo["state_distribution"].items())[:10]:
        print(f"  - {state:<22}: {count} scheme(s)")

    print("\n--------------------------------------------------------------------------------")
    print("3. CATEGORY DISTRIBUTION")
    print("--------------------------------------------------------------------------------")
    for cat, count in report["category_distribution"].items():
        print(f"  - {cat:<40}: {count} scheme(s)")

    print("\n================================================================================")


def main():
    parser = argparse.ArgumentParser(description="Raw Dataset Profiling & Data Quality Audit (Ticket 1.2)")
    parser.add_argument("--file", default=DEFAULT_RAW_CSV, help="Path to raw CSV dataset")
    parser.add_argument("--output", default=DEFAULT_REPORT_JSON, help="Output JSON profile report path")
    args = parser.parse_args()

    report = profile_csv_dataset(args.file)
    print_profile_report(report)

    # Save JSON report
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved JSON schema profiling report to: {args.output}\n")


if __name__ == "__main__":
    main()
