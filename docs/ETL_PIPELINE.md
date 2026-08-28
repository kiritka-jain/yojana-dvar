# ETL Ingestion Pipeline Guide (Ticket 2.2)

This document details the ETL ingestion pipeline for **Yojana Dvar** (Epic 2 — Data Engineering & ETL Pipeline).

---

## 1. Pipeline Overview

The ETL pipeline script [`scripts/etl_load_schemes.py`](file:///Users/kirtikaj/workspace/yojanadvar/yojana-dvar/scripts/etl_load_schemes.py) ingests raw welfare scheme datasets from `data/raw/`, applies women-centric filtering criteria, parses and standardizes data types, deduplicates records by `scheme_id`, and exports processed catalog datasets ready for BigQuery loading into `data/processed/`.

```
┌─────────────────────────────────┐
│     Raw Datasets (data/raw/)    │
│  - indian_government_schemes    │
│  - huggingface_welfare_schemes  │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│    ETL Script (etl_load_schemes)│
│  1. Ingest raw CSV/JSON         │
│  2. Women Filter Logic          │
│  3. Type casting & JSON parsing │
│  4. Slugify & Deduplicate       │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  Processed Catalog              │
│  - data/processed/schemes_women │
│    (.json & .csv)               │
└─────────────────────────────────┘
```

---

## 2. Women Filter Logic (TDD Section 6.2)

The ETL script evaluates every raw scheme record to determine relevance for women:

1. **Gender Match**: Scheme `gender` is explicitly `Female` or `Women`.
2. **Keyword Filter**: Title, category, target beneficiary description, or summary text contains women-centric keywords:
   - `women`, `woman`, `girl`, `mahila`, `matru`, `sukanya`, `widow`, `stand-up`, `kanya`, `ladli`, `maternal`, `mother`, `penn`, `sakhi`, `female`, `balika`, `pregnant`, `lactating`.

Schemes failing both criteria are filtered out before catalog generation.

---

## 3. Schema Transformation & Type Casting

The ETL script standardizes all incoming fields into the target BigQuery `schemes_women` table schema:

| Target Field | Data Type | Default / Cleaning Rationale |
|--------------|-----------|------------------------------|
| `scheme_id` | `STRING` | Clean slug generated via title or raw ID slugification |
| `name` | `STRING` | Standardized scheme title string |
| `description` | `STRING` | Scheme summary / overview narrative |
| `ministry` | `STRING` | Nodal central/state ministry |
| `department` | `STRING` | Nodal administrative department |
| `state` | `STRING` | Target state or `All` |
| `category` | `STRING` | Primary domain category |
| `beneficiary_type` | `STRING` | Target beneficiary group |
| `benefits` | `STRING` | Benefit description text |
| `eligibility_text` | `STRING` | Complete narrative eligibility conditions |
| `documents_required` | `STRING` | Required document list string |
| `application_process` | `STRING` | Direct portal application instructions |
| `apply_url` | `STRING` | Direct URL for online application |
| `official_url` | `STRING` | Official portal homepage URL |
| `age_min` | `INT64` | Parsed integer minimum age (default: `0`) |
| `age_max` | `INT64` | Parsed integer maximum age (default: `100`) |
| `gender` | `STRING` | Standardized gender requirement (`Female`, `All`) |
| `caste_categories` | `STRING (JSON)` | Standardized JSON array string (e.g. `["SC", "ST", "OBC", "General"]` or `["All"]`) |
| `income_max` | `INT64` | Parsed integer max income cap in INR (default: `0`) |
| `residence` | `STRING` | `Rural`, `Urban`, or `All` |
| `eligible_states` | `STRING (JSON)` | Standardized JSON array string (e.g. `["All"]` or `["Uttar Pradesh"]`) |
| `requires_bpl` | `BOOL` | Parsed boolean flag (`True`/`False`) |
| `requires_disability` | `BOOL` | Parsed boolean flag (`True`/`False`) |
| `life_stage_tags` | `STRING (JSON)` | Standardized JSON array string (e.g. `["maternal"]`, `["student"]`, `["entrepreneur"]`) |
| `is_active` | `BOOL` | Operational status flag (`True`) |
| `updated_at` | `TIMESTAMP` | UTC ISO-8601 timestamp string |

---

## 4. Execution & Verification

To execute the ETL pipeline:

```bash
python3 scripts/etl_load_schemes.py
```

### Verification Outputs:
- Processed JSON catalog: `data/processed/schemes_women.json`
- Processed CSV catalog: `data/processed/schemes_women.csv`
- Zero error exit status (`exit 0`).
