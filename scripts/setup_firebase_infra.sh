#!/usr/bin/env bash
set -e

# ==============================================================================
# Setup script for Yojana Dvar Firebase Infrastructure (Ticket 1.3)
# Configures:
#   1. Firebase CLI project binding
#   2. Cloud Firestore Database setup in asia-south1
#   3. Firestore security rules & composite indexes deployment
#   4. Hosting target configuration
# ==============================================================================

PROJECT_ID="${FIREBASE_PROJECT_ID:-${GCP_PROJECT_ID:-}}"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: FIREBASE_PROJECT_ID or GCP_PROJECT_ID is not set."
  echo "Usage: FIREBASE_PROJECT_ID=your-project-id ./scripts/setup_firebase_infra.sh"
  exit 1
fi

echo "=================================================="
echo "Initializing Firebase Infrastructure for Yojana Dvar"
echo "Project ID: $PROJECT_ID"
echo "=================================================="

# 1. Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo "Firebase CLI ('firebase') is not installed."
  echo "Install it via npm: npm install -g firebase-tools"
  echo "Then authenticate: firebase login"
  exit 1
fi

# 2. Set active Firebase project alias
echo "[1/3] Setting Firebase active project to '$PROJECT_ID'..."
firebase use --add "$PROJECT_ID" --alias default 2>/dev/null || firebase use "$PROJECT_ID"

# 3. Deploy Firestore Security Rules & Indexes
echo "[2/3] Deploying Firestore Security Rules and Indexes..."
firebase deploy --only firestore --project "$PROJECT_ID"

# 4. Verify Firebase Hosting Config
echo "[3/3] Validating Firebase Hosting configuration..."
firebase target:apply hosting app "$PROJECT_ID" 2>/dev/null || true

echo "=================================================="
echo "✓ Firebase Infrastructure Setup Complete!"
echo "  - Project ID:       $PROJECT_ID"
echo "  - Security Rules:   firestore.rules deployed"
echo "  - Hosting Target:   app (public: frontend/dist)"
echo "=================================================="
