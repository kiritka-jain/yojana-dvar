#!/usr/bin/env bash
set -e

# ==============================================================================
# Setup script for Yojana Dvar GCP Infrastructure (Ticket 1.2)
# Provisions:
#   1. BigQuery dataset 'yojana_dvar' in region asia-south1
#   2. Secret Manager secret 'gemini-api-key'
#   3. Cloud Run Service Account 'yojana-dvar-runner' with IAM roles:
#      - roles/bigquery.dataViewer
#      - roles/bigquery.jobUser
#      - roles/secretmanager.secretAccessor
# ==============================================================================

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo "")}"
REGION="${GCP_REGION:-asia-south1}"
DATASET_NAME="yojana_dvar"
SECRET_NAME="gemini-api-key"
SA_NAME="yojana-dvar-runner"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: GCP_PROJECT_ID is not set and no default gcloud project found."
  echo "Usage: GCP_PROJECT_ID=your-project-id ./scripts/setup_gcp_infra.sh"
  exit 1
fi

echo "=================================================="
echo "Initializing GCP Infrastructure for Yojana Dvar"
echo "Project ID: $PROJECT_ID"
echo "Region:     $REGION"
echo "=================================================="

# 1. Enable required GCP APIs
echo "[1/5] Enabling GCP Service APIs..."
gcloud services enable \
  bigquery.googleapis.com \
  secretmanager.googleapis.com \
  run.googleapis.com \
  iam.googleapis.com \
  --project="$PROJECT_ID"

# 2. Create BigQuery Dataset
echo "[2/5] Creating BigQuery dataset '$DATASET_NAME' in location '$REGION'..."
if bq show --project_id="$PROJECT_ID" "$DATASET_NAME" >/dev/null 2>&1; then
  echo "✓ BigQuery dataset '$DATASET_NAME' already exists."
else
  bq --location="$REGION" mk \
    --dataset \
    --description="Yojana Dvar scheme catalog and telemetry dataset" \
    "$PROJECT_ID:$DATASET_NAME"
  echo "✓ BigQuery dataset '$DATASET_NAME' created successfully."
fi

# 3. Create Secret Manager Secret
echo "[3/5] Creating Secret Manager secret '$SECRET_NAME'..."
if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo "✓ Secret '$SECRET_NAME' already exists."
else
  gcloud secrets create "$SECRET_NAME" \
    --replication-policy="automatic" \
    --project="$PROJECT_ID"
  echo "✓ Secret '$SECRET_NAME' created."
  echo "  Note: Store your API key version using:"
  echo "  echo -n 'YOUR_API_KEY' | gcloud secrets versions add $SECRET_NAME --data-file=- --project=$PROJECT_ID"
fi

# 4. Create Service Account for Cloud Run
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
echo "[4/5] Creating Service Account '$SA_NAME'..."
if gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo "✓ Service account '$SA_EMAIL' already exists."
else
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="Yojana Dvar Cloud Run Execution Service Account" \
    --project="$PROJECT_ID"
  echo "✓ Service account '$SA_EMAIL' created."
fi

# 5. Bind IAM Roles
echo "[5/5] Binding IAM roles to Service Account '$SA_EMAIL'..."
ROLES=(
  "roles/bigquery.dataViewer"
  "roles/bigquery.jobUser"
  "roles/secretmanager.secretAccessor"
)

for ROLE in "${ROLES[@]}"; do
  echo "  - Binding $ROLE..."
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" \
    --condition=None \
    --quiet >/dev/null
done

echo "=================================================="
echo "✓ GCP Infrastructure Setup Complete!"
echo "Summary:"
echo "  - BigQuery Dataset: $PROJECT_ID:$DATASET_NAME ($REGION)"
echo "  - Secret Manager:   $SECRET_NAME"
echo "  - Service Account:  $SA_EMAIL"
echo "=================================================="
