-- ==============================================================================
-- Yojana Dvar — BigQuery Schema Definitions (Ticket 2.3)
-- Dataset: yojana_dvar
-- Region:  asia-south1
-- ==============================================================================

-- 1. Schemes Women Catalog Table (`yojana_dvar.schemes_women`)
CREATE TABLE IF NOT EXISTS `yojana_dvar.schemes_women` (
  scheme_id STRING OPTIONS(description="Unique slug identifier for scheme"),
  name STRING OPTIONS(description="Full official name of scheme"),
  description STRING OPTIONS(description="Scheme summary description"),
  ministry STRING OPTIONS(description="Nodal sponsoring ministry"),
  department STRING OPTIONS(description="Nodal administrative department"),
  state STRING OPTIONS(description="Target state name or 'All'"),
  category STRING OPTIONS(description="Primary category domain"),
  beneficiary_type STRING OPTIONS(description="Target beneficiary group"),
  benefits STRING OPTIONS(description="Entitlement benefits summary"),
  eligibility_text STRING OPTIONS(description="Narrative eligibility criteria"),
  documents_required STRING OPTIONS(description="Document checklist text"),
  application_process STRING OPTIONS(description="Application procedure instructions"),
  apply_url STRING OPTIONS(description="Direct application URL"),
  official_url STRING OPTIONS(description="Official portal homepage URL"),
  age_min INT64 OPTIONS(description="Minimum age bound"),
  age_max INT64 OPTIONS(description="Maximum age bound"),
  gender STRING OPTIONS(description="Applicable gender restriction"),
  caste_categories STRING OPTIONS(description="JSON array string of eligible castes"),
  income_max INT64 OPTIONS(description="Maximum family income cap in INR"),
  residence STRING OPTIONS(description="Target residence type (Rural/Urban/All)"),
  eligible_states STRING OPTIONS(description="JSON array string of eligible states"),
  requires_bpl BOOL OPTIONS(description="Below Poverty Line requirement flag"),
  requires_disability BOOL OPTIONS(description="Disability status requirement flag"),
  life_stage_tags STRING OPTIONS(description="JSON array string of life stage tags"),
  is_active BOOL OPTIONS(description="Active scheme flag"),
  updated_at TIMESTAMP OPTIONS(description="UTC timestamp of last update")
)
OPTIONS(
  description="Yojana Dvar women entitlement scheme catalog table"
);

-- 2. Match Telemetry Logs Table (`yojana_dvar.match_logs`)
CREATE TABLE IF NOT EXISTS `yojana_dvar.match_logs` (
  match_id STRING OPTIONS(description="Unique match execution UUID"),
  user_id STRING OPTIONS(description="Optional authenticated user UID"),
  input_profile_json STRING OPTIONS(description="JSON payload of input demographic profile"),
  matched_scheme_ids_json STRING OPTIONS(description="JSON array string of returned scheme IDs"),
  match_count INT64 OPTIONS(description="Number of schemes matched"),
  execution_time_ms FLOAT64 OPTIONS(description="Match engine execution time in milliseconds"),
  created_at TIMESTAMP OPTIONS(description="UTC timestamp of match query")
)
OPTIONS(
  description="Telemetry log table for rule-based match requests"
);
