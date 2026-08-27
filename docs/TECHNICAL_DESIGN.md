# Yojana Dvar — Technical Design Document

**Project:** Yojana Dvar — Women's Gateway to Welfare Entitlements  
**Version:** 1.0  
**Status:** Build Phase (Patchamomma 2026)  
**Target delivery:** 4 September 2026  
**Authors:** Kirtika & Team  

---

## 1. Executive Summary

Yojana Dvar is a women-focused web application that helps users discover government welfare schemes they may qualify for, understand eligibility in plain language, and reach official application channels.

The system ingests structured public scheme datasets into **Google BigQuery**, matches user profiles via a **rule-based eligibility engine**, serves results through a **Cloud Run (FastAPI)** API, persists user data in **Cloud Firestore**, exposes a **React** frontend on **Firebase Hosting**, and uses **Gemini** for Hindi/English eligibility explanations.

This document defines architecture, data models, APIs, security, deployment, and delivery milestones for the MVP scope.

---

## 2. Goals and Non-Goals

### 2.1 Goals (MVP — by 4 Sep 2026)

- Aggregate women-relevant schemes from public datasets into a queryable catalog.
- Accept a short demographic profile and return ranked eligible schemes.
- Display scheme cards with benefits, eligibility summary, documents, and official apply links.
- Explain top matches in plain Hindi or English using Gemini.
- Provide three one-click demo personas for presentations.
- Allow optional login to save profile and bookmark schemes (Firebase Auth + Firestore).
- Deploy publicly on Firebase Hosting (frontend) and Cloud Run (backend).

### 2.2 Non-Goals (Phase 2+)

- Direct in-app submission of scheme applications.
- Voice chatbot or multi-agent orchestration (ADK).
- Real-time ingestion from government APIs (requires separate approval).
- Analytics dashboards (Looker Studio).
- Full multilingual UI beyond Gemini output language selection.
- Offline/PWA support.
- Legal adjudication of eligibility (system is advisory only).

---

## 3. System Architecture

### 3.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User (Browser)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Firebase Hosting — React SPA (Vite)                │
│   Pages: Home | Find Schemes | Results | Detail | About | Auth  │
└──────────────┬─────────────────────────────┬────────────────────┘
               │                             │
               │ HTTPS                       │ Firebase SDK
               ▼                             ▼
┌──────────────────────────┐    ┌─────────────────────────────────┐
│   Cloud Run (FastAPI)    │    │  Firebase Auth + Cloud Firestore │
│   REST API               │    │  users, profiles, bookmarks      │
└──────┬─────────┬─────────┘    └─────────────────────────────────┘
       │         │
       │         └──────────────────┐
       ▼                            ▼
┌──────────────┐            ┌─────────────────┐
│   BigQuery   │            │  Gemini API     │
│ schemes_women│            │  (AI Studio key)│
│ match logic  │            └─────────────────┘
└──────────────┘
       ▲
       │ load (ETL)
┌──────────────┐
│ Cloud Storage│
│ raw CSV/JSON │
└──────────────┘
```

---

## 4. Data Design

### 4.1 BigQuery Schema (`schemes_women`)

Dataset: `yojana_dvar`, Table: `schemes_women`

Columns:
`scheme_id` (STRING), `name` (STRING), `description` (STRING), `ministry` (STRING), `department` (STRING), `state` (STRING), `category` (STRING), `beneficiary_type` (STRING), `benefits` (STRING), `eligibility_text` (STRING), `documents_required` (STRING), `application_process` (STRING), `apply_url` (STRING), `official_url` (STRING), `age_min` (INT64), `age_max` (INT64), `gender` (STRING), `caste_categories` (STRING), `income_max` (INT64), `residence` (STRING), `eligible_states` (STRING), `requires_bpl` (BOOL), `requires_disability` (BOOL), `life_stage_tags` (STRING), `is_active` (BOOL), `updated_at` (TIMESTAMP).

---

## 5. Technology Stack

- **GCP**: BigQuery, Cloud Run, Cloud Storage, Secret Manager, Cloud Logging
- **Firebase**: Firebase Hosting, Firebase Authentication, Cloud Firestore
- **Backend**: Python 3.11+, FastAPI, Pydantic, Uvicorn, Google GenAI SDK
- **Frontend**: React 18, Vite, CSS
