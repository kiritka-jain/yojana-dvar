# Yojana Dvar — Women's Gateway to Welfare Entitlements

Yojana Dvar is a women-focused web application that helps users discover government welfare schemes they qualify for, understand eligibility in plain language (Hindi & English), and reach official application channels.

## Tech Stack
- **Frontend**: React 18, Vite, CSS, Firebase Hosting
- **Backend**: FastAPI, Python 3.11+, Cloud Run
- **Database / Data Warehouse**: Google BigQuery (`schemes_women`), Cloud Firestore (users & bookmarks)
- **AI / LLM**: Gemini API via Google AI Studio (`google-genai`)
- **Authentication**: Firebase Authentication

## Project Structure
```
yojana-dvar/
├── docs/             # Technical Design Document and Implementation Plan
│   ├── TECHNICAL_DESIGN.md
│   └── PROJECT_PLAN.md
├── backend/          # FastAPI REST API server
│   ├── app/          # Core application logic, routers, services, models
│   ├── Dockerfile    # Cloud Run container definition
│   └── requirements.txt
├── frontend/         # React SPA (Vite)
├── scripts/          # Ingestion & ETL scripts
├── firebase.json     # Firebase hosting configuration
└── README.md
```

## Quick Start

### Backend (Dev)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (Dev)
```bash
cd frontend
npm install
npm run dev
```

## License & Advisory Note
This tool is strictly advisory. Official eligibility must be verified on official government portals before applying.
