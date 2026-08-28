#!/usr/bin/env bash
set -e

# ==============================================================================
# Yojana Dvar — Local Development & Data Pipeline Runner
# ==============================================================================
# Usage: ./scripts/run_local.sh
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

echo "=================================================="
echo "🚀 Yojana Dvar — Local Development Runner"
echo "=================================================="

# 1. Step 1: Run Local Dataset Acquisition (Ticket 2.1)
echo ""
echo "[Step 1/3] Acquiring & Staging Raw Datasets..."
python3 scripts/stage_raw_datasets.py --local-only

# 2. Step 2: Run Local ETL Processing Pipeline (Ticket 2.2)
echo ""
echo "[Step 2/3] Running ETL Pipeline to generate processed scheme catalog..."
python3 scripts/etl_load_schemes.py

# 3. Step 3: Run BigQuery Schema Validation (Ticket 2.3)
echo ""
echo "[Step 3/3] Validating processed catalog against BigQuery schema..."
python3 scripts/load_bigquery.py --dry-run

echo ""
echo "=================================================="
echo "✓ Data Pipeline & BigQuery Schema Validation Complete!"
echo "  Processed Catalog: data/processed/schemes_women.json"
echo "  CSV Export:        data/processed/schemes_women.csv"
echo "  BigQuery DDL SQL:  scripts/schema_schemes_women.sql"
echo "=================================================="
echo ""
echo "💡 Quick Start Commands for Backend & Frontend:"
echo ""
echo "  Backend API Server (FastAPI):"
echo "    cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload"
echo ""
echo "  Frontend SPA (React + Vite):"
echo "    cd frontend && npm install && npm run dev"
echo ""
echo "=================================================="
