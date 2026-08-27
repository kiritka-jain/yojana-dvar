# Yojana Dvar — Implementation Plan

**Project:** Yojana Dvar — Women's Gateway to Welfare Entitlements  
**Version:** 1.0  
**Target Delivery:** 4 September 2026  

---

## 1. Overview & Strategy

This document lays out the step-by-step technical implementation plan for **Yojana Dvar**, translating the Technical Design Document into actionable **Epics**, **Tickets**, and **Sub-tasks**.

The implementation is structured around 7 core Epics aligned with project delivery milestones (M1–M6). Each ticket is designed to be self-contained with clear scope, acceptance criteria, and verification steps.

---

## 2. Epics & Milestones Summary

| Epic ID | Title | Target Milestone | Delivery Date |
|---------|-------|------------------|---------------|
| **Epic 1** | Repository Architecture & Cloud Infrastructure Foundation | M1 Foundation & Data | 24 Aug 2026 |
| **Epic 2** | Data Engineering & ETL Pipeline | M1 Foundation & Data | 24 Aug 2026 |
| **Epic 3** | FastAPI Backend Core & Eligibility Match Engine | M2 Backend & AI | 28 Aug 2026 |
| **Epic 4** | Gemini AI Explanation Service | M2 Backend & AI | 28 Aug 2026 |
| **Epic 5** | Firebase Auth & User Data Persistence | M3 User Layer | 29 Aug 2026 |
| **Epic 6** | React Frontend Application & High-Aesthetic UI | M4 Website | 1 Sep 2026 |
| **Epic 7** | Deployment, Testing & Release Readiness | M5 Deploy & M6 Final Delivery | 4 Sep 2026 |

---

## 3. Detailed Breakdown: Epics, Tickets & Sub-Tasks

---

### Epic 1: Repository Architecture & Cloud Infrastructure Foundation (Milestone M1 — 24 Aug 2026)
**Goal:** Initialize project directory hierarchy, configure GCP services, IAM policies, and Firebase project.

#### Ticket 1.1: Repository Structure & Boilerplate Initialization
- **Scope:** Establish standard project directory structure according to TDD Section 18.
- **Tasks:**
  - Create directory layout: `docs/`, `backend/`, `frontend/`, `scripts/`.
  - Initialize Git workspace with appropriate `.gitignore` (excluding secrets, node_modules, Python virtualenvs, `.env`).
  - Create placeholder configuration files (`firebase.json`, `.gcloudignore`).
- **Acceptance Criteria:** Directory tree matches standard layout; git status is clean.

#### Ticket 1.2: GCP Infrastructure & Secret Manager Setup
- **Scope:** Provision GCP BigQuery dataset, Secret Manager secrets, and IAM service accounts.
- **Tasks:**
  - Create BigQuery dataset `yojana_dvar` in region `asia-south1`.
  - Create Secret Manager secret `gemini-api-key`.
  - Create Cloud Run service account `yojana-dvar-runner` with roles:
    - `roles/bigquery.dataViewer`
    - `roles/bigquery.jobUser`
    - `roles/secretmanager.secretAccessor`
- **Acceptance Criteria:** `gcloud` CLI commands confirm dataset, secret, and IAM bindings exist.

#### Ticket 1.3: Firebase Project & Authentication Setup
- **Scope:** Initialize Firebase project for Auth, Firestore, and Hosting.
- **Tasks:**
  - Enable Firebase Authentication (Email/Password & Phone OTP).
  - Initialize Cloud Firestore database in `asia-south1`.
  - Configure `firebase.json` for SPA routing (`rewrites` to `/index.html`).
- **Acceptance Criteria:** Firebase CLI detects active project; Auth and Firestore are provisioned.

---

### Epic 2: Data Engineering & ETL Pipeline (Milestone M1 — 24 Aug 2026)
**Goal:** Ingest public welfare datasets, apply women-centric ETL filters, and load into BigQuery.

#### Ticket 2.1: Dataset Acquisition & Staging
- **Scope:** Download and stage Kaggle and Hugging Face government scheme datasets.
- **Tasks:**
  - Gather source CSV/JSON files from Kaggle & Hugging Face (`indian-government-schemes-2025`).
  - Upload raw files to Cloud Storage bucket `gs://yojana-dvar-raw/`.
- **Acceptance Criteria:** Raw data files successfully staged in Cloud Storage.

#### Ticket 2.2: ETL Ingestion Script (`scripts/etl_load_schemes.py`)
- **Scope:** Build Python pandas script to process raw schemes into structured BigQuery catalog.
- **Tasks:**
  - Implement Women Filter Logic (Section 6.2):
    - Category / beneficiary matching (`women`, `girl`, `mahila`, `matru`, `sukanya`, `widow`, `stand-up`).
    - Gender filtering (`female` or `all`).
  - Implement structured field parser:
    - Clean `age_min`, `age_max`, `income_max`.
    - Map `caste_categories`, `eligible_states`, `life_stage_tags` into JSON strings.
    - Set boolean flags `requires_bpl`, `requires_disability`, `is_active`.
  - Deduplicate schemes by `scheme_id` slug.
- **Acceptance Criteria:** ETL script runs cleanly and generates structured DataFrame.

#### Ticket 2.3: BigQuery Table Creation & Schema Loading
- **Scope:** Create BigQuery table `schemes_women` and load dataset.
- **Tasks:**
  - Define schema for `schemes_women` matching TDD Section 6.3.
  - Create optional `match_logs` table for query telemetry.
  - Execute loader script to populate `schemes_women`.
  - Perform validation queries to check scheme count and data completeness.
- **Acceptance Criteria:** `schemes_women` contains clean schemes; `SELECT COUNT(*) FROM yojana_dvar.schemes_women` > 0.

---

### Epic 3: FastAPI Backend Core & Eligibility Match Engine (Milestone M2 — 28 Aug 2026)
**Goal:** Build the Cloud Run FastAPI REST API with deterministic rule-based matching.

#### Ticket 3.1: FastAPI Boilerplate & Middleware
- **Scope:** Set up FastAPI project scaffold, health endpoint, Pydantic schemas, and CORS.
- **Tasks:**
  - Configure `backend/requirements.txt` (`fastapi`, `uvicorn`, `pydantic`, `google-cloud-bigquery`, `google-genai`, `firebase-admin`).
  - Implement `GET /api/v1/health` endpoint returning system uptime and version.
  - Configure CORS middleware allowing Firebase Hosting domain.
  - Set up structured JSON logging (`Cloud Logging`).
- **Acceptance Criteria:** `GET /health` returns HTTP 200 `{ "status": "ok", "version": "1.0" }`.

#### Ticket 3.2: Eligibility Match Engine (`services/matcher.py`)
- **Scope:** Implement deterministic rule matching logic using BigQuery SQL execution.
- **Tasks:**
  - Build Pydantic `ProfileInput` validation model (state, age, gender, caste, income, residence, lifeStage, occupation, education, isBpl, hasDisability).
  - Construct parameterized SQL query applying hard rules (Section 7.2):
    - Gender, age range, state, caste, max income, residence, BPL, disability, active status.
  - Implement ranking algorithm (Section 7.3):
    - Life-stage boost score (+weight).
    - State-specific over central boost (+weight).
    - Tie-breaking.
- **Acceptance Criteria:** Match engine takes profile object and returns top N (default 10) matching scheme records.

#### Ticket 3.3: Scheme Search & Match API Endpoints
- **Scope:** Expose `/match`, `/schemes/{id}`, and `/schemes/search` endpoints.
- **Tasks:**
  - Endpoint `POST /api/v1/match`: Accepts demographic profile, returns `matchId`, `count`, ranked `schemes`.
  - Endpoint `GET /api/v1/schemes/{schemeId}`: Returns complete scheme details.
  - Endpoint `GET /api/v1/schemes/search?q={query}&state={state}`: Enables keyword search over name, description, category.
- **Acceptance Criteria:** Valid HTTP requests return correctly structured JSON responses per API spec (Section 8.1).

#### Ticket 3.4: Demo Personas Endpoint (`GET /personas`)
- **Scope:** Provide pre-built demo persona profiles for presentation testing.
- **Tasks:**
  - Hardcode 3 demo personas (`priya`: 19/KA/OBC/Student, `sunita`: 26/BR/SC/Pregnant/BPL, `lakshmi`: 42/TN/SC/Entrepreneur).
  - Expose `GET /api/v1/personas`.
- **Acceptance Criteria:** `GET /personas` returns array of 3 structured persona objects.

---

### Epic 4: Gemini AI Explanation Service (Milestone M2 — 28 Aug 2026)
**Goal:** Integrate Gemini API to generate plain-language eligibility explanations and document checklists in Hindi & English.

#### Ticket 4.1: Secret Manager & Gemini Client Setup (`services/gemini.py`)
- **Scope:** Securely initialize Gemini client using Secret Manager API key.
- **Tasks:**
  - Fetch `GEMINI_API_KEY` from environment / Secret Manager on startup.
  - Initialize `google-genai` client instance.
- **Acceptance Criteria:** Service initializes without committing secrets; handles missing key gracefully.

#### Ticket 4.2: Multilingual Prompt Engine & Explanation Endpoint (`POST /explain`)
- **Scope:** Build prompt builder and `/explain` REST endpoint.
- **Tasks:**
  - Implement prompt engineering with strict guardrails (Section 9.2):
    - Tone: Friendly, advisory.
    - Languages: Hindi (`hi`) and English (`en`).
    - Output: Plain language match rationale + document checklist summary.
    - Required Disclaimer: Always append verification warning.
  - Implement `POST /api/v1/explain` endpoint.
- **Acceptance Criteria:** Request with valid `schemeId` and profile returns Hindi/English JSON response containing explanation text, document list, and disclaimer.

#### Ticket 4.3: Resilience & Fallback Engine
- **Scope:** Ensure service reliability with strict timeouts and static template fallbacks.
- **Tasks:**
  - Implement 15-second timeout on Gemini API calls.
  - Create static fallback explanation generator using scheme metadata in case of Gemini failure/rate-limit.
- **Acceptance Criteria:** If Gemini call exceeds 15s or fails, API returns HTTP 200 with template fallback explanation without breaking UX.

---

### Epic 5: Firebase Auth & User Data Persistence (Milestone M3 — 29 Aug 2026)
**Goal:** Enable user accounts, profile saving, bookmarking, and match history in Cloud Firestore.

#### Ticket 5.1: Firebase Admin SDK Auth Middleware
- **Scope:** Implement token validation middleware for protected API routes.
- **Tasks:**
  - Initialize Firebase Admin SDK in FastAPI.
  - Create `get_current_user` Dependency verifying `Authorization: Bearer <token>`.
  - Return HTTP 401 on missing/expired tokens.
- **Acceptance Criteria:** Unauthenticated requests to protected endpoints return 401; valid token injects `uid`.

#### Ticket 5.2: Firestore Data Access Service (`services/firestore.py`)
- **Scope:** Implement Firestore read/write operations for user subcollections.
- **Tasks:**
  - Profile operations (`users/{uid}/profiles/{profileId}`): create, get, update.
  - Bookmark operations (`users/{uid}/bookmarks/{schemeId}`): add, list, delete.
  - Match history logging (`users/{uid}/match_history/{matchId}`).
- **Acceptance Criteria:** Firestore documents are correctly created, read, and deleted.

#### Ticket 5.3: User Endpoints Integration
- **Scope:** Expose user profile and bookmark API endpoints.
- **Tasks:**
  - `POST /api/v1/users/profile`
  - `GET /api/v1/users/bookmarks`
  - `POST /api/v1/users/bookmarks/{schemeId}`
  - `DELETE /api/v1/users/bookmarks/{schemeId}`
- **Acceptance Criteria:** Authenticated user can save profile, add bookmarks, list bookmarks, and remove bookmarks.

---

### Epic 6: React Frontend Application & High-Aesthetic UI (Milestone M4 — 1 Sep 2026)
**Goal:** Build a modern, responsive React SPA with premium design, dynamic animations, and full backend integration.

#### Ticket 6.1: React + Vite Project Setup & Design System Foundation
- **Scope:** Initialize Vite React project and design system styling tokens.
- **Tasks:**
  - Create React 18 + Vite project in `frontend/`.
  - Build `index.css` design system:
    - Typography (Google Fonts: Inter / Outfit).
    - Color palette (Deep Indigo, Warm Gold, Soft Rose, Slate Dark Mode).
    - Glassmorphism utilities, subtle gradient backgrounds, smooth micro-animations.
  - Configure responsive container layouts.
- **Acceptance Criteria:** Clean Vite build running locally with design tokens established.

#### Ticket 6.2: Firebase Auth Context & API Integration Client
- **Scope:** Set up frontend Firebase SDK, Auth Context provider, and Axios/Fetch API client.
- **Tasks:**
  - Initialize Firebase JS SDK (`auth`, `firestore`).
  - Create `AuthContext` managing current user state, login, signup, logout.
  - Build API client module adding Bearer token headers automatically.
- **Acceptance Criteria:** Auth state persists across page reloads; API client passes Bearer token when logged in.

#### Ticket 6.3: Landing Page & One-Click Demo Personas (`/`)
- **Scope:** Build landing page with problem context, CTA, and 1-click persona quick-starts.
- **Tasks:**
  - Hero section explaining Yojana Dvar entitlement discovery.
  - 1-Click Demo Persona Cards (Priya, Sunita, Lakshmi) with instant match preview.
  - Key feature highlights & trust badges.
- **Acceptance Criteria:** Clicking any demo persona fills profile and navigates directly to `/results`.

#### Ticket 6.4: Interactive Discovery Form Page (`/find`)
- **Scope:** Build accessible, multi-step or grouped demographic profile form.
- **Tasks:**
  - Form fields: State dropdown, Age slider/input, Caste category, Annual Income, Residence type (rural/urban), Life Stage tag (student, maternal, entrepreneur, senior, etc.), BPL toggle, Disability toggle.
  - Preset loader when selecting a demo persona.
  - Client-side validation.
- **Acceptance Criteria:** User can adjust inputs, submit form, and trigger backend `/match` request.

#### Ticket 6.5: Results Page & Matched Scheme Cards (`/results`)
- **Scope:** Display ranked scheme matches with benefit summaries and match scores.
- **Tasks:**
  - Scheme card component: Scheme title, Ministry badge, Match Score %, Benefit summary snippet, Life stage tags.
  - Quick bookmark button (if authenticated).
  - Empty state & skeleton loading animations.
  - Filter/sort controls.
- **Acceptance Criteria:** Displays matched schemes from API call; clicking a card opens detail view.

#### Ticket 6.6: Scheme Detail Page & AI Explanation View (`/schemes/:id`)
- **Scope:** Complete scheme view with benefits, document list, official apply link, and AI explain tool.
- **Tasks:**
  - Scheme overview: Benefits, eligibility text, nodal ministry/department.
  - Document checklist display.
  - Direct "Apply on Official Portal" CTA button (`rel="noopener" target="_blank"`).
  - **AI Explanation Component**:
    - Language Toggle (Hindi / English).
    - "Explain My Eligibility" trigger button.
    - Animated loading state during Gemini call.
    - Formatted response display with official disclaimer alert.
- **Acceptance Criteria:** Detail view renders all attributes; AI explanation button fetches and displays Hindi/English text within SLA.

#### Ticket 6.7: Saved Bookmarks & User Profile Page (`/bookmarks`)
- **Scope:** Provide user dashboard for viewing saved schemes and managing demographic profile.
- **Tasks:**
  - Protected route requiring authentication.
  - Bookmarked scheme cards grid with one-click remove option.
  - Saved demographic profile summary.
- **Acceptance Criteria:** Logged-in user sees their saved bookmarks; unauthenticated user is prompted to login.

#### Ticket 6.8: About Page & Static Disclaimer (`/about`)
- **Scope:** Build vision page, data source credits, and official advisory disclaimer.
- **Tasks:**
  - Project mission & alignment with women entitlement discovery.
  - Data sources attribution (Kaggle, HuggingFace, Ministry public domains).
  - Explicit legal advisory disclaimer.
- **Acceptance Criteria:** Page renders cleanly with full disclaimers and links.

---

### Epic 7: Deployment, Testing & Release Readiness (Milestone M5 & M6 — 2–4 Sep 2026)
**Goal:** Containerize backend, deploy to Cloud Run & Firebase Hosting, and execute E2E verification.

#### Ticket 7.1: Automated Unit & Integration Testing Suite
- **Scope:** Build test suite for backend match rules, API schemas, and prompt builders.
- **Tasks:**
  - Pytest unit tests for `matcher.py` (verify rule boundary conditions: age limits, income caps, state filtering).
  - FastAPI `TestClient` endpoint tests (`/health`, `/match`, `/explain`, `/personas`).
- **Acceptance Criteria:** `pytest` passes with 100% success rate on core matching rules.

#### Ticket 7.2: Containerization & Cloud Run Backend Deployment
- **Scope:** Build Docker container and deploy FastAPI backend to GCP Cloud Run.
- **Tasks:**
  - Create production Dockerfile (Python 3.11 slim, uvicorn execution).
  - Deploy to Cloud Run:
    ```bash
    gcloud run deploy yojana-dvar-api \
      --source ./backend \
      --region asia-south1 \
      --allow-unauthenticated \
      --set-secrets GEMINI_API_KEY=gemini-api-key:latest
    ```
- **Acceptance Criteria:** Cloud Run URL is live and passing `/health` check over HTTPS.

#### Ticket 7.3: Frontend Production Build & Firebase Hosting Deployment
- **Scope:** Build optimized production React bundle and deploy to Firebase Hosting.
- **Tasks:**
  - Set `VITE_API_BASE_URL` to Cloud Run live URL.
  - Run `npm run build` in `frontend/`.
  - Deploy via Firebase CLI: `firebase deploy --only hosting`.
- **Acceptance Criteria:** Web app is publicly accessible via Firebase Hosting URL (`https://yojana-dvar.web.app`).

#### Ticket 7.4: End-to-End Persona Verification & Final Acceptance
- **Scope:** Perform manual and automated E2E verification of primary user flows.
- **Tasks:**
  - Verify Persona `Sunita`: Returns ≥ 3 schemes (e.g., PMMVY / Matru Vandana).
  - Verify Gemini Explain: Returns fluent Hindi explanation within 15 seconds.
  - Verify Apply Button: Directs to official portal in new tab.
  - Verify Security: Git history audit ensuring no raw secrets exist.
- **Acceptance Criteria:** All acceptance criteria in TDD Section 14 met.

---

## 4. Verification & Testing Matrix

| Testing Level | Scope | Method / Command | Target Result |
|---------------|-------|------------------|---------------|
| **Unit** | Matcher rules, age/income filters | `pytest backend/tests/test_matcher.py` | 100% boundary tests pass |
| **Integration** | FastAPI endpoints & BigQuery | `pytest backend/tests/test_api.py` | All API status 200/400 handled |
| **AI Reliability** | Gemini explanations | `POST /explain` with test profile | Valid Hindi/EN text < 15s SLA |
| **Security Audit** | Codebase secrets check | `git log -p | grep API_KEY` | Zero committed keys |
| **E2E Demo** | 3 Demo Personas (Priya, Sunita, Lakshmi) | Browser E2E verification | Persona profiles yield correct scheme matches |

---

*Document finalized on 24 Aug 2026 for Yojana Dvar MVP build phase.*
