# BigQuery Dataset & Schema Guide (Ticket 2.3)

This document details the Google BigQuery table schemas, loading instructions, and validation queries for **Yojana Dvar** (Epic 2 — Data Engineering & ETL Pipeline).

---

## 1. Overview

Yojana Dvar utilizes Google BigQuery as its primary analytical scheme catalog store and query telemetry data warehouse.

- **Dataset**: `yojana_dvar`
- **Location / Region**: `asia-south1`
- **Catalog Table**: `yojana_dvar.schemes_women`
- **Telemetry Table**: `yojana_dvar.match_logs`

---

## 2. Table Schemas

### 2.1 Scheme Catalog Table (`yojana_dvar.schemes_women`)

| Field Name | Type | Mode | Description |
|------------|------|------|-------------|
| `scheme_id` | `STRING` | **REQUIRED** | Unique slug identifier (e.g. `pmmvy-central`, `ssy-central`) |
| `name` | `STRING` | **REQUIRED** | Full official title of the scheme |
| `description` | `STRING` | NULLABLE | Scheme overview description narrative |
| `ministry` | `STRING` | NULLABLE | Sponsoring central/state ministry |
| `department` | `STRING` | NULLABLE | Administrative department |
| `state` | `STRING` | NULLABLE | Target state name or `All` |
| `category` | `STRING` | NULLABLE | Primary domain category |
| `beneficiary_type` | `STRING` | NULLABLE | Beneficiary target description |
| `benefits` | `STRING` | NULLABLE | Benefits summary text |
| `eligibility_text` | `STRING` | NULLABLE | Complete eligibility criteria narrative |
| `documents_required` | `STRING` | NULLABLE | Required document checklist |
| `application_process` | `STRING` | NULLABLE | Application procedure instructions |
| `apply_url` | `STRING` | NULLABLE | Direct URL for online application |
| `official_url` | `STRING` | NULLABLE | Official portal homepage URL |
| `age_min` | `INT64` | NULLABLE | Minimum age requirement bound |
| `age_max` | `INT64` | NULLABLE | Maximum age requirement bound |
| `gender` | `STRING` | NULLABLE | Gender requirement (`Female`, `All`) |
| `caste_categories` | `STRING` | NULLABLE | Standardized JSON array string of eligible castes (e.g. `["All"]`) |
| `income_max` | `INT64` | NULLABLE | Maximum family annual income limit in INR |
| `residence` | `STRING` | NULLABLE | Target residence type (`Rural`, `Urban`, `All`) |
| `eligible_states` | `STRING` | NULLABLE | Standardized JSON array string of eligible states |
| `requires_bpl` | `BOOL` | NULLABLE | Below Poverty Line requirement indicator |
| `requires_disability` | `BOOL` | NULLABLE | Disability status requirement indicator |
| `life_stage_tags` | `STRING` | NULLABLE | Standardized JSON array string of life stage tags |
| `is_active` | `BOOL` | NULLABLE | Operational status flag |
| `updated_at` | `TIMESTAMP` | NULLABLE | UTC timestamp of last update |

---

### 2.2 Match Telemetry Logs Table (`yojana_dvar.match_logs`)

| Field Name | Type | Mode | Description |
|------------|------|------|-------------|
| `match_id` | `STRING` | **REQUIRED** | Unique match execution UUID |
| `user_id` | `STRING` | NULLABLE | Authenticated user UID (if logged in) |
| `input_profile_json` | `STRING` | NULLABLE | Input demographic profile payload |
| `matched_scheme_ids_json` | `STRING` | NULLABLE | Array of returned scheme IDs |
| `match_count` | `INT64` | NULLABLE | Total number of schemes matched |
| `execution_time_ms` | `FLOAT64` | NULLABLE | Match engine latency in milliseconds |
| `created_at` | `TIMESTAMP` | NULLABLE | UTC creation timestamp |

---

## 3. Creating & Loading Tables

### 3.1 DDL SQL Table Creation
Table definitions are specified in [`scripts/schema_schemes_women.sql`](file:///Users/kirtikaj/workspace/yojanadvar/yojana-dvar/scripts/schema_schemes_women.sql).

Execute via `bq` CLI:
```bash
bq query --use_legacy_sql=false --project_id=YOUR_PROJECT_ID < scripts/schema_schemes_women.sql
```

### 3.2 Loading Data via Python Script
Run [`scripts/load_bigquery.py`](file:///Users/kirtikaj/workspace/yojanadvar/yojana-dvar/scripts/load_bigquery.py) to validate and load processed scheme catalog records:

```bash
# Dry run schema validation
python3 scripts/load_bigquery.py --dry-run

# Live BigQuery Load
python3 scripts/load_bigquery.py --project YOUR_PROJECT_ID
```

---

## 4. Acceptance Criteria Verification Queries

Execute the following BigQuery SQL queries to verify data completeness and ticket acceptance criteria:

```sql
-- 1. Verify scheme count (Acceptance Criteria: SELECT COUNT(*) > 0)
SELECT COUNT(*) as total_schemes FROM `yojana_dvar.schemes_women`;

-- 2. Inspect active schemes by life stage
SELECT 
  scheme_id, 
  name, 
  state, 
  age_min, 
  age_max, 
  income_max, 
  life_stage_tags 
FROM `yojana_dvar.schemes_women` 
WHERE is_active = TRUE;
```
