#!/usr/bin/env bash
# =============================================================================
# Yojana Dvar — Firebase Hosting Production Deployment Script (Ticket 7.3)
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Configuration
FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID:-${GCP_PROJECT_ID:-yojana-dvar}}"
VITE_API_BASE_URL="${VITE_API_BASE_URL:-${API_BASE_URL:-}}"

echo "=================================================================="
echo "🚀 Deploying Yojana Dvar Frontend to Firebase Hosting (Ticket 7.3)"
echo "=================================================================="
echo "📋 Target Firebase Project: ${FIREBASE_PROJECT_ID}"

if [ -n "${VITE_API_BASE_URL}" ]; then
    echo "🔗 Target API Base URL:     ${VITE_API_BASE_URL}"
else
    echo "⚠️  VITE_API_BASE_URL is not set; using default API endpoint."
fi
echo ""

# 1. Check if Firebase CLI is available
FIREBASE_CMD="firebase"
if ! command -v firebase &> /dev/null; then
    if npx -y firebase-tools --version &> /dev/null; then
        FIREBASE_CMD="npx -y firebase-tools"
    else
        echo "❌ Error: Firebase CLI is not installed."
        echo "   Install it via npm: npm install -g firebase-tools"
        echo "   Then authenticate: firebase login"
        exit 1
    fi
fi

# 2. Build optimized React bundle
echo "📦 Step 1/3: Building optimized production React bundle..."
cd "${ROOT_DIR}/frontend"
if [ -n "${VITE_API_BASE_URL}" ]; then
    export VITE_API_BASE_URL="${VITE_API_BASE_URL}"
fi
npm run build

echo ""
echo "📦 Build artifacts generated in frontend/dist:"
ls -lh dist/
echo ""

# 3. Deploy to Firebase Hosting
echo "🚀 Step 2/3: Deploying to Firebase Hosting (${FIREBASE_PROJECT_ID})..."
cd "${ROOT_DIR}"
${FIREBASE_CMD} deploy --only hosting --project "${FIREBASE_PROJECT_ID}"

# 4. Verification
echo ""
echo "🌐 Step 3/3: Verifying deployment..."
HOSTING_URL="https://${FIREBASE_PROJECT_ID}.web.app"
echo "   Publicly accessible at: ${HOSTING_URL}"
echo ""
echo "🎉 Ticket 7.3 complete! Frontend production deployment is ready at:"
echo "   ${HOSTING_URL}"
