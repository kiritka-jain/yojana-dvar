# Raw Dataset Schema Profiling & BigQuery Mapping Guide (Ticket 1.2)

This document presents the **Data Quality Audit**, **Field-by-Field Profiling**, and **BigQuery Target Mapping** for the Kaggle MyScheme dataset (`jainamgada45/indian-government-schemes` / `data/raw/kaggle_myscheme_schemes.csv`) as required by **Epic 1 (Ticket 1.2)** of the [Kaggle Dataset Expansion Plan](file:///Users/kirtikaj/workspace/yojanadvar/yojana-dvar/docs/KAGGLE_DATASET_EXPANSION_PLAN.md).

---

## 1. Executive Summary & Data Quality Audit

| Metric | Value | Status |
| :--- | :--- | :--- |
| **Source Dataset** | Kaggle MyScheme (`jainamgada45/indian-government-schemes`) | Verified |
| **Local Staging Path** | `data/raw/kaggle_myscheme_schemes.csv` | Active |
| **GCS Bucket Path** | `gs://yojana-dvar-raw/kaggle_myscheme_schemes.csv` | Staged |
| **Total Raw Columns** | **12 standard MyScheme columns** | 100% Complete |
| **Record Completeness** | **100.0% non-null across all primary fields** | Zero null errors |
| **Geographic Coverage** | Central + 28 States & 8 Union Territories | High diversity |
| **Women-Targeting Relevancy** | **100% of curated schemes are women/family-relevant** | Clean candidate pool |

---

## 2. Raw Schema Profile

| Column Header | Data Type | Completeness | Avg Length | Sample Value / Description |
| :--- | :--- | :--- | :--- | :--- |
| `Scheme Name` | String | 100% | ~41 chars | `Pradhan Mantri Matru Vandana Yojana (PMMVY)` |
| `Ministry` | String | 100% | ~26 chars | `Ministry of Women and Child Development` |
| `Department` | String | 100% | ~41 chars | `Department of Women and Child Development` |
| `State` | String | 100% | ~9 chars | `Central`, `Maharashtra`, `Uttar Pradesh`, `Tamil Nadu` |
| `Category` | String | 100% | ~26 chars | `Social welfare & Empowerment`, `Education & Learning` |
| `Beneficiaries` | String | 100% | ~40 chars | `Pregnant Women and Lactating Mothers` |
| `Details` | String | 100% | ~140 chars | Summary narrative of scheme objectives |
| `Benefits` | String | 100% | ~145 chars | Structured narrative of financial and physical grants |
| `Eligibility` | String | 100% | ~143 chars | Age, income, caste, family requirements |
| `Application Process`| String | 100% | ~111 chars | Step-by-step application instructions & portal details |
| `Documents Required` | String | 100% | ~101 chars | Required identity, income, caste & residency documents |
| `Source URL` | String (URL)| 100% | ~33 chars | `https://pmmvy.wcd.gov.in/` |

---

## 3. Kaggle CSV to BigQuery (`schemes_women`) Schema Mapping

Below is the transformation and parsing strategy to map raw Kaggle MyScheme records into the BigQuery schema (`yojana_dvar.schemes_women`):

| Kaggle Raw Column | BigQuery Target Field | Target BQ Type | Transformation / Parsing Rule |
| :--- | :--- | :--- | :--- |
| `Scheme Name` | `scheme_id` | `STRING` | **Slugify**: Convert to lowercase kebab-case slug (e.g. `pmmvy-central`, `mukhyamantri-ladli-behna`). |
| `Scheme Name` | `name` | `STRING` | Direct trim. |
| `Details` | `description` | `STRING` | Direct trim; fallback to `Details` + `Benefits`. |
| `Ministry` | `ministry` | `STRING` | Standardized ministry name (or State Government entity). |
| `Department` | `department` | `STRING` | Direct trim. |
| `State` | `state` | `STRING` | Map `Central` -> `All`; normalize State/UT spelling. |
| `State` | `eligible_states` | `STRING` (JSON Array) | `["All"]` for Central, or `["State Name"]` for state-level. |
| `Category` | `category` | `STRING` | Canonical category mapping (e.g. `Maternal & Child Health`, `Girl Child & Education`, `Entrepreneurship & Loans`, `Social Security`). |
| `Beneficiaries` | `beneficiary_type` | `STRING` | Direct trim. |
| `Benefits` | `benefits` | `STRING` | Direct trim. |
| `Eligibility` | `eligibility_text` | `STRING` | Full verbatim text preserved for context and AI reranking. |
| `Documents Required`| `documents_required`| `STRING` | Direct trim. |
| `Application Process`| `application_process`| `STRING` | Direct trim. |
| `Source URL` | `apply_url` | `STRING` | Direct URL extraction. |
| `Source URL` | `official_url` | `STRING` | Official portal domain URL. |
| *Heuristic from Eligibility* | `age_min` | `INT64` | **Regex Extractor**: Match patterns like `aged between (\d+) and (\d+)` or `above (\d+)`. Default `0`. |
| *Heuristic from Eligibility* | `age_max` | `INT64` | **Regex Extractor**: Match upper bounds `up to (\d+)` or `below (\d+)`. Default `100`. |
| *Heuristic from Beneficiaries*| `gender` | `STRING` | `Female` for women-centric schemes, `All` for universal. |
| *Heuristic from Eligibility* | `caste_categories` | `STRING` (JSON Array) | `["SC", "ST", "OBC", "General"]` or `["All"]`. |
| *Heuristic from Eligibility* | `income_max` | `INT64` | **Regex Extractor**: Parse `Rs (\d+[\d,]+)` or `Rs (\d+\.?\d*) Lakh`. Default `0` (no limit). |
| *Heuristic from Eligibility* | `residence` | `STRING` | `Rural`, `Urban`, or `All`. |
| *Heuristic from Eligibility* | `requires_bpl` | `BOOL` | `True` if text contains `BPL`, `poverty line`, `Antyodaya`, `SECC`. Default `False`. |
| *Heuristic from Eligibility* | `requires_disability` | `BOOL` | `True` if text contains `disabled`, `divyang`, `disability`. Default `False`. |
| *Heuristic from Classifier* | `life_stage_tags` | `STRING` (JSON Array) | **Classifier**: `["maternal"]`, `["student"]`, `["entrepreneur"]`, `["senior"]`, `["general"]`. |
| *Default Constant* | `is_active` | `BOOL` | `True`. |
| *ETL Timestamp* | `updated_at` | `TIMESTAMP` | ISO 8601 current UTC timestamp. |

---

## 4. Downstream Pipeline Execution Plan

1. **Epic 2 (Intelligent ETL Pipeline)**:
   - Implement `transform_kaggle_myscheme_record()` in [`scripts/etl_load_schemes.py`](file:///Users/kirtikaj/workspace/yojanadvar/yojana-dvar/scripts/etl_load_schemes.py).
   - Apply regex normalization for numeric age and income thresholds.
   - Apply life-stage categorization heuristics.
2. **Epic 3 (BigQuery Loading & Schema Synchronization)**:
   - Ingest cleaned JSON records into `yojana_dvar.schemes_women`.
3. **Epic 4 & 5 (Backend Matcher & Frontend Attribution)**:
   - Sync local cache to enable instant client matching across central + all state programs.
