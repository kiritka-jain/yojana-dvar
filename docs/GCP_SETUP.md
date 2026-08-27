# GCP Infrastructure Setup Guide (Ticket 1.2)

This guide documents the Google Cloud Platform (GCP) resources required for **Yojana Dvar** and provides commands to provision them.

---

## 1. Required GCP Resources

| Resource Type | Resource Identifier | Region / Location | Description |
|---------------|----------------------|-------------------|-------------|
| **BigQuery Dataset** | `yojana_dvar` | `asia-south1` | Scheme catalog table (`schemes_women`) and telemetry |
| **Secret Manager** | `gemini-api-key` | Automatic / Global | Encrypted storage for Google AI Studio Gemini API key |
| **Service Account** | `yojana-dvar-runner@<project>.iam.gserviceaccount.com` | Global | Cloud Run execution identity with minimal required roles |

---

## 2. Required IAM Roles

The Cloud Run execution service account (`yojana-dvar-runner`) requires the following least-privilege IAM roles:

1. `roles/bigquery.dataViewer`: Query tables in dataset `yojana_dvar`.
2. `roles/bigquery.jobUser`: Run BigQuery query jobs.
3. `roles/secretmanager.secretAccessor`: Access `gemini-api-key` secret payloads at runtime.

---

## 3. Automated Provisioning

You can provision all resources automatically using the provided setup script:

```bash
# 1. Export your GCP Project ID
export GCP_PROJECT_ID="your-gcp-project-id"

# 2. Run setup script
./scripts/setup_gcp_infra.sh
```

---

## 4. Manual `gcloud` Commands

If you prefer executing commands manually:

### 4.1 Enable GCP APIs
```bash
gcloud services enable \
  bigquery.googleapis.com \
  secretmanager.googleapis.com \
  run.googleapis.com \
  iam.googleapis.com \
  --project="YOUR_PROJECT_ID"
```

### 4.2 Create BigQuery Dataset
```bash
bq --location="asia-south1" mk \
  --dataset \
  --description="Yojana Dvar scheme catalog" \
  YOUR_PROJECT_ID:yojana_dvar
```

### 4.3 Create Secret Manager Secret & Add Version
```bash
# Create secret metadata
gcloud secrets create gemini-api-key \
  --replication-policy="automatic" \
  --project="YOUR_PROJECT_ID"

# Add API Key version
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key \
  --data-file=- \
  --project="YOUR_PROJECT_ID"
```

### 4.4 Create Service Account & Bind IAM Roles
```bash
# Create service account
gcloud iam service-accounts create yojana-dvar-runner \
  --display-name="Yojana Dvar Cloud Run Service Account" \
  --project="YOUR_PROJECT_ID"

SA_EMAIL="yojana-dvar-runner@YOUR_PROJECT_ID.iam.gserviceaccount.com"

# Bind roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/bigquery.dataViewer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/bigquery.jobUser"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 5. Verification Commands

To verify that all resources were provisioned correctly matching Ticket 1.2 acceptance criteria:

```bash
# Verify BigQuery dataset
bq show YOUR_PROJECT_ID:yojana_dvar

# Verify Secret Manager secret
gcloud secrets describe gemini-api-key --project="YOUR_PROJECT_ID"

# Verify Service Account & IAM policy bindings
gcloud iam service-accounts describe yojana-dvar-runner@YOUR_PROJECT_ID.iam.gserviceaccount.com --project="YOUR_PROJECT_ID"
gcloud projects get-iam-policy YOUR_PROJECT_ID --flatten="bindings[].members" --format='table(bindings.role)' --filter="bindings.members:yojana-dvar-runner"
```
