#!/usr/bin/env bash
# =============================================================================
# Yojana Dvar — Cloud Run Backend Deployment Script (Ticket 7.2)
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Configuration
SERVICE_NAME="yojana-dvar-api"
GCP_REGION="${GCP_REGION:-asia-south1}"
GCP_PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo "")}"

echo "=================================================================="
echo "🚀 Deploying Yojana Dvar Backend to GCP Cloud Run (Ticket 7.2)"
echo "=================================================================="

# 1. Validate gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: 'gcloud' CLI is not installed or not in PATH."
    echo "   Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    echo "   Or via Homebrew: brew install --cask gcloud-cli"
    exit 1
fi

# 2. Validate GCP Project ID
if [ -z "${GCP_PROJECT_ID}" ]; then
    echo "❌ Error: GCP Project ID is not set."
    echo "   Export it before running: export GCP_PROJECT_ID=\"your-project-id\""
    echo "   Or set it in gcloud: gcloud config set project your-project-id"
    exit 1
fi

echo "📋 Target Project: ${GCP_PROJECT_ID}"
echo "📍 Target Region:  ${GCP_REGION}"
echo "📦 Target Service: ${SERVICE_NAME}"
echo ""

# 3. Ensure processed scheme data is packaged with backend
echo "📦 Verifying scheme catalog data is packaged in backend..."
mkdir -p "${ROOT_DIR}/backend/data/processed"
if [ -f "${ROOT_DIR}/data/processed/schemes_women.json" ]; then
    cp "${ROOT_DIR}/data/processed/schemes_women.json" "${ROOT_DIR}/backend/data/processed/schemes_women.json"
    echo "   ✔ Catalog copied to backend/data/processed/schemes_women.json"
fi

# 4. Check if gemini-api-key secret exists in Secret Manager
SECRET_FLAG=()
if gcloud secrets describe gemini-api-key --project="${GCP_PROJECT_ID}" &>/dev/null; then
    echo "🔒 Secret 'gemini-api-key' found in Secret Manager; binding to Cloud Run..."
    SECRET_FLAG=(--set-secrets "GEMINI_API_KEY=gemini-api-key:latest")
else
    echo "⚠️  Secret 'gemini-api-key' not found in Secret Manager."
    if [ -n "${GEMINI_API_KEY:-}" ]; then
        echo "   Passing GEMINI_API_KEY via environment variable..."
        SECRET_FLAG=(--set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY},GCP_PROJECT_ID=${GCP_PROJECT_ID}")
    else
        echo "   Deploying in fallback mode (GEMINI_API_KEY deferred)..."
        SECRET_FLAG=(--set-env-vars "GCP_PROJECT_ID=${GCP_PROJECT_ID}")
    fi
fi

# 5. Execute Cloud Run deployment
echo ""
echo "🚀 Executing gcloud run deploy..."
cd "${ROOT_DIR}"
gcloud run deploy "${SERVICE_NAME}" \
    --source ./backend \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --allow-unauthenticated \
    "${SECRET_FLAG[@]}"

# 6. Retrieve Service URL and verify health
echo ""
echo "🔍 Retrieving Cloud Run live URL..."
SERVICE_URL="$(gcloud run services describe "${SERVICE_NAME}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --format 'value(status.url)')"

echo "🌐 Live URL: ${SERVICE_URL}"
echo ""
echo "🩺 Verifying /health check over HTTPS..."
HEALTH_RESPONSE="$(curl -s -f "${SERVICE_URL}/health" || echo "FAIL")"

if [ "${HEALTH_RESPONSE}" != "FAIL" ]; then
    echo "✔ Health check passed successfully over HTTPS:"
    echo "   ${HEALTH_RESPONSE}"
    echo ""
    echo "🎉 Ticket 7.2 complete! Cloud Run backend is live at:"
    echo "   ${SERVICE_URL}"
else
    echo "❌ Health check failed or timed out. Please check Cloud Run logs:"
    echo "   gcloud run services logs tail ${SERVICE_NAME} --project ${GCP_PROJECT_ID} --region ${GCP_REGION}"
    exit 1
fi
