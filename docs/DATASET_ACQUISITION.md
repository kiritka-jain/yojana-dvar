# Dataset Acquisition & Staging Guide (Ticket 2.1)

This document details the raw dataset acquisition and staging strategy for **Yojana Dvar** (Epic 2 — Data Engineering & ETL Pipeline).

---

## 1. Overview

Yojana Dvar aggregates government scheme information from public datasets (including Kaggle and Hugging Face repositories like `indian-government-schemes-2025`). 

Raw datasets are staged locally under `data/raw/` and uploaded to Google Cloud Storage bucket `gs://yojana-dvar-raw/`. The downstream ETL script (`scripts/etl_load_schemes.py`) processes these raw files to clean, standardize, and load the women-filtered scheme catalog into BigQuery (`yojana_dvar.schemes_women`).

---

## 2. Dataset Inventory

| Dataset Identifier | File Format | Source / Origin | Description | Target Local Path |
|--------------------|-------------|-----------------|-------------|-------------------|
| `indian-government-schemes-2025` | CSV (`.csv`) | Kaggle / MyScheme Public Data | Comprehensive catalog of central & state welfare schemes | `data/raw/indian_government_schemes_2025.csv` |
| `huggingface-welfare-schemes` | JSON (`.json`) | Hugging Face Datasets Hub | Structured scheme metadata with nested eligibility rules and tags | `data/raw/huggingface_welfare_schemes.json` |

---

## 3. Raw Data Schemas

### 3.1 CSV Raw Schema (`indian_government_schemes_2025.csv`)
- `scheme_id`: Unique slug identifier (e.g. `pmmvy-central`, `ssy-central`).
- `scheme_name`: Full official name of the welfare scheme.
- `ministry_name`: Nodal ministry (e.g. `Ministry of Women and Child Development`).
- `department_name`: Nodal department.
- `state_name`: Target state or `All` for central schemes.
- `scheme_category`: Feature domain (e.g. `Maternal & Child Health`, `Girl Child & Education`).
- `target_beneficiary`: Beneficiary description text.
- `scheme_benefits`: Summary of financial, educational, or material entitlements.
- `eligibility_criteria_text`: Narrative description of eligibility conditions.
- `required_documents`: Document checklist requirements.
- `application_url`: Direct portal URL for application submission.
- `official_website`: Official ministry portal homepage.
- `min_age` / `max_age`: Lower and upper age boundaries.
- `gender_applicable`: Applicable gender restriction (`Female`, `All`).
- `caste_category`: Target caste category (`All`, `SC`, `ST`, `OBC`, `General`).
- `max_income_limit`: Annual family income cap in INR (0 if no cap).
- `residence_type`: `Rural`, `Urban`, or `All`.
- `eligible_states_list`: Applicable states list string.
- `is_bpl_required` / `is_disability_required`: Boolean indicators (`True`/`False`).
- `life_stage`: Primary tag (`maternal`, `student`, `entrepreneur`, `senior`, `general`).
- `active_status`: Scheme operational flag (`True`/`False`).

### 3.2 JSON Raw Schema (`huggingface_welfare_schemes.json`)
- `hf_id`: Dataset record key.
- `title`: Scheme name.
- `organization`: Sponsoring body or ministry.
- `geography`: Scope (`All India` or state name).
- `domain`: Category area.
- `summary`: Scheme overview.
- `eligibility`: Nested dictionary containing age, income, gender, and special condition rules.
- `benefits_text`: Entitlement benefits text.
- `documents`: List of required document strings.
- `urls`: Object containing `apply` and `portal` URLs.
- `tags`: Tag list for categorization.

---

## 4. Staging Script Execution

The acquisition and staging workflow is automated via `scripts/stage_raw_datasets.py`.

### 4.1 Running Acquisition & Local Staging
To acquire and stage raw datasets locally:
```bash
python3 scripts/stage_raw_datasets.py --local-only
```

### 4.2 Running Full Staging with GCS Cloud Storage
To upload staged raw files to GCS bucket `gs://yojana-dvar-raw/`:
```bash
# Optional: Specify custom GCS bucket
export GCS_RAW_BUCKET="yojana-dvar-raw"

python3 scripts/stage_raw_datasets.py
```

---

## 5. Verification Steps

1. Verify raw file creation:
   ```bash
   ls -lh data/raw/
   ```
2. Verify CSV headers and record counts:
   ```bash
   head -n 2 data/raw/indian_government_schemes_2025.csv
   ```
3. Check Cloud Storage bucket contents (if GCP credentials active):
   ```bash
   gcloud storage ls gs://yojana-dvar-raw/
   ```
