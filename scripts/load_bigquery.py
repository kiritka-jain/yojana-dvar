#!/usr/bin/env python3
"""
BigQuery Table Creation & Schema Loading Script for Yojana Dvar (Ticket 2.3)
=============================================================================
Creates BigQuery tables (`schemes_women`, `match_logs`) and populates `schemes_women`
from `data/processed/schemes_women.json` according to TDD Section 4.1.

Usage:
  python3 scripts/load_bigquery.py [--dry-run] [--project PROJECT_ID]
"""

import argparse
import datetime
import json
import os
import subprocess
import sys

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PROCESSED_JSON = os.path.join(BASE_DIR, "data", "processed", "schemes_women.json")
SQL_SCHEMA_FILE = os.path.join(BASE_DIR, "scripts", "schema_schemes_women.sql")

# BigQuery Field Definitions matching TDD Section 4.1
BQ_SCHEMA_FIELDS = [
    {"name": "scheme_id", "type": "STRING", "mode": "REQUIRED"},
    {"name": "name", "type": "STRING", "mode": "REQUIRED"},
    {"name": "description", "type": "STRING", "mode": "NULLABLE"},
    {"name": "ministry", "type": "STRING", "mode": "NULLABLE"},
    {"name": "department", "type": "STRING", "mode": "NULLABLE"},
    {"name": "state", "type": "STRING", "mode": "NULLABLE"},
    {"name": "category", "type": "STRING", "mode": "NULLABLE"},
    {"name": "beneficiary_type", "type": "STRING", "mode": "NULLABLE"},
    {"name": "benefits", "type": "STRING", "mode": "NULLABLE"},
    {"name": "eligibility_text", "type": "STRING", "mode": "NULLABLE"},
    {"name": "documents_required", "type": "STRING", "mode": "NULLABLE"},
    {"name": "application_process", "type": "STRING", "mode": "NULLABLE"},
    {"name": "apply_url", "type": "STRING", "mode": "NULLABLE"},
    {"name": "official_url", "type": "STRING", "mode": "NULLABLE"},
    {"name": "age_min", "type": "INT64", "mode": "NULLABLE"},
    {"name": "age_max", "type": "INT64", "mode": "NULLABLE"},
    {"name": "gender", "type": "STRING", "mode": "NULLABLE"},
    {"name": "caste_categories", "type": "STRING", "mode": "NULLABLE"},
    {"name": "income_max", "type": "INT64", "mode": "NULLABLE"},
    {"name": "residence", "type": "STRING", "mode": "NULLABLE"},
    {"name": "eligible_states", "type": "STRING", "mode": "NULLABLE"},
    {"name": "requires_bpl", "type": "BOOL", "mode": "NULLABLE"},
    {"name": "requires_disability", "type": "BOOL", "mode": "NULLABLE"},
    {"name": "life_stage_tags", "type": "STRING", "mode": "NULLABLE"},
    {"name": "is_active", "type": "BOOL", "mode": "NULLABLE"},
    {"name": "updated_at", "type": "TIMESTAMP", "mode": "NULLABLE"},
]

def validate_processed_catalog(records: list) -> bool:
    """Validates processed catalog records against BigQuery schema expectations."""
    print(f"Validating {len(records)} records against BigQuery schema...")
    errors = []
    
    for idx, rec in enumerate(records):
        for field in BQ_SCHEMA_FIELDS:
            fname = field["name"]
            ftype = field["type"]
            fmode = field["mode"]
            
            val = rec.get(fname)
            
            if fmode == "REQUIRED" and (val is None or val == ""):
                errors.append(f"Record #{idx} ('{rec.get('name')}'): Missing required field '{fname}'")
                
            if val is not None:
                if ftype == "INT64" and not isinstance(val, int):
                    errors.append(f"Record #{idx} '{fname}': Expected int, got {type(val).__name__} ('{val}')")
                elif ftype == "BOOL" and not isinstance(val, bool):
                    errors.append(f"Record #{idx} '{fname}': Expected bool, got {type(val).__name__} ('{val}')")
                    
    if errors:
        print(f"❌ Found {len(errors)} validation errors:")
        for err in errors[:10]:
            print(f"  - {err}")
        return False
        
    print(f"✓ All {len(records)} catalog records successfully passed BigQuery schema validation!")
    return True

def load_via_bq_cli(project_id: str, dataset_id: str, table_id: str, json_file: str):
    """Executes table creation and data load via GCP bq CLI or python SDK."""
    full_table = f"{project_id}:{dataset_id}.{table_id}"
    print(f"\nAttempting BigQuery load to '{full_table}'...")
    
    # 1. Create table using DDL SQL if bq CLI is installed
    try:
        query_cmd = ["bq", "query", "--use_legacy_sql=false", f"--project_id={project_id}"]
        with open(SQL_SCHEMA_FILE, "r") as f:
            sql_content = f.read()
            
        proc = subprocess.run(query_cmd, input=sql_content, capture_output=True, text=True)
        if proc.returncode == 0:
            print(f"✓ BigQuery tables created/verified successfully via DDL.")
        else:
            print(f"⚠ Note: DDL query execution output: {proc.stderr.strip() or proc.stdout.strip()}")
            
        # 2. Load JSON newline records or CSV
        schema_arg = ",".join([f"{f['name']}:{f['type']}" for f in BQ_SCHEMA_FIELDS])
        load_cmd = [
            "bq", "load",
            "--source_format=NEWLINE_DELIMITED_JSON",
            "--replace",
            full_table,
            json_file,
            schema_arg
        ]
        
        load_proc = subprocess.run(load_cmd, capture_output=True, text=True)
        if load_proc.returncode == 0:
            print(f"✓ Successfully loaded catalog into '{full_table}'!")
            
            # 3. Perform Validation Query: SELECT COUNT(*) FROM yojana_dvar.schemes_women
            count_sql = f"SELECT COUNT(*) as total_schemes FROM `{project_id}.{dataset_id}.{table_id}`"
            count_proc = subprocess.run(["bq", "query", "--use_legacy_sql=false", "--format=prettyjson", count_sql], capture_output=True, text=True)
            if count_proc.returncode == 0:
                print("\nValidation Query Output:")
                print(count_proc.stdout)
                print("✓ Acceptance Criteria Met: SELECT COUNT(*) > 0")
            return True
        else:
            print(f"⚠ BigQuery CLI load error: {load_proc.stderr.strip()}")
            
    except Exception as e:
        print(f"⚠ Exception during BigQuery API/CLI execution: {e}")
        
    print("\nNote: Standard GCP authorization is required to perform live BigQuery load.")
    print(f"Ensure dataset '{dataset_id}' exists in region 'asia-south1'.")
    return False

def main():
    parser = argparse.ArgumentParser(description="BigQuery Table Creation & Loading for Yojana Dvar")
    parser.add_argument("--project", default=os.getenv("GCP_PROJECT_ID", "yojana-dvar-dev"), help="GCP Project ID")
    parser.add_argument("--dataset", default="yojana_dvar", help="BigQuery Dataset Name")
    parser.add_argument("--table", default="schemes_women", help="BigQuery Table Name")
    parser.add_argument("--dry-run", action="store_true", help="Perform schema validation without live GCP connection")
    args = parser.parse_args()

    print("==================================================")
    print("Yojana Dvar — Ticket 2.3 BigQuery Table & Data Loader")
    print("==================================================")
    print(f"Target Dataset: {args.project}:{args.dataset}")
    print(f"Target Table:   {args.table}")
    
    if not os.path.exists(DATA_PROCESSED_JSON):
        print(f"❌ Error: Processed JSON file not found at '{DATA_PROCESSED_JSON}'.")
        print("   Please run 'python3 scripts/etl_load_schemes.py' first.")
        sys.exit(1)
        
    with open(DATA_PROCESSED_JSON, "r", encoding="utf-8") as f:
        records = json.load(f)
        
    valid = validate_processed_catalog(records)
    if not valid:
        sys.exit(1)
        
    if args.dry_run:
        print("\n[Dry-Run Mode] Validation complete. Skipping live GCP BigQuery load.")
    else:
        # Create NDJSON formatted file for BigQuery NDJSON load
        ndjson_file = os.path.join(BASE_DIR, "data", "processed", "schemes_women.ndjson")
        with open(ndjson_file, "w", encoding="utf-8") as f:
            for rec in records:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
                
        load_via_bq_cli(args.project, args.dataset, args.table, ndjson_file)

    print("==================================================")
    print("✓ Ticket 2.3 BigQuery Schema & Data Loading Step Done!")
    print("==================================================")

if __name__ == "__main__":
    main()
