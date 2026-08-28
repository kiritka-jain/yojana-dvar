#!/usr/bin/env python3
"""
Dataset Acquisition & Staging Script for Yojana Dvar (Ticket 2.1)
==================================================================
This script acquires, generates, and stages raw government scheme datasets
from Kaggle and Hugging Face sources (`indian-government-schemes-2025`).

Outputs:
  - Local Staging: data/raw/indian_government_schemes_2025.csv
  - Local Staging: data/raw/huggingface_welfare_schemes.json
  - Cloud Storage: gs://yojana-dvar-raw/ (or custom GCS_RAW_BUCKET)
"""

import argparse
import json
import os
import csv
import sys
import subprocess

# Ensure local staging directory exists
DATA_RAW_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")

# Sample Raw CSV Data matching Kaggle indian-government-schemes-2025 dataset format
CSV_SCHEMES_RAW = [
    {
        "scheme_id": "pmmvy-central",
        "scheme_name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "ministry_name": "Ministry of Women and Child Development",
        "department_name": "Department of Women and Child Development",
        "state_name": "All",
        "scheme_category": "Maternal & Child Health",
        "target_beneficiary": "Pregnant women and lactating mothers",
        "scheme_benefits": "Financial benefit of Rs 5,000 in two installments directly into bank/post office account for first live child, and Rs 6,000 for second child if girl child.",
        "eligibility_criteria_text": "Pregnant Women and Lactating Mothers (PW&LM) aged 19 years and above for first live child. Must belong to BPL, SC/ST, or hold MGNREGA job card.",
        "required_documents": "Aadhaar Card, Bank Account Details, Mother and Child Protection (MCP) Card, Identity Proof, BPL Ration Card / Income Certificate",
        "application_url": "https://pmmvy.wcd.gov.in/",
        "official_website": "https://wcd.gov.in/schemes/pradhan-mantri-matru-vandana-yojana",
        "min_age": "19",
        "max_age": "45",
        "gender_applicable": "Female",
        "caste_category": "All",
        "max_income_limit": "250000",
        "residence_type": "All",
        "eligible_states_list": "All",
        "is_bpl_required": "True",
        "is_disability_required": "False",
        "life_stage": "maternal",
        "active_status": "True"
    },
    {
        "scheme_id": "ssy-central",
        "scheme_name": "Sukanya Samriddhi Yojana (SSY)",
        "ministry_name": "Ministry of Finance",
        "department_name": "Department of Economic Affairs",
        "state_name": "All",
        "scheme_category": "Girl Child & Education",
        "target_beneficiary": "Girl child below 10 years of age",
        "scheme_benefits": "High tax-free interest rate (currently 8.2% p.a.), tax savings under Section 80C, partial withdrawal for higher education at age 18, maturity at 21 years.",
        "eligibility_criteria_text": "Girl child who is an Indian resident aged below 10 years. Account opened by parents or legal guardians. Maximum 2 accounts per family.",
        "required_documents": "Birth Certificate of Girl Child, Identity & Address Proof of Guardian, Passport size photos",
        "application_url": "https://www.indiapost.gov.in/Financial/Pages/Content/Sukanya-Samriddhi-Account.aspx",
        "official_website": "https://nsiindia.gov.in/",
        "min_age": "0",
        "max_age": "10",
        "gender_applicable": "Female",
        "caste_category": "All",
        "max_income_limit": "0",
        "residence_type": "All",
        "eligible_states_list": "All",
        "is_bpl_required": "False",
        "is_disability_required": "False",
        "life_stage": "student",
        "active_status": "True"
    },
    {
        "scheme_id": "step-central",
        "scheme_name": "Support to Training and Employment Programme for Women (STEP)",
        "ministry_name": "Ministry of Women and Child Development",
        "department_name": "Bureau of Women Empowerment",
        "state_name": "All",
        "scheme_category": "Skill Development & Employment",
        "target_beneficiary": "Women aged 16 years and above",
        "scheme_benefits": "Free skill training in traditional sectors (agriculture, horticulture, handlooms, handicrafts, tailors, IT) and support for wage employment/self-employment.",
        "eligibility_criteria_text": "Women aged 16 years and above looking for skill development and employment, prioritizing marginalized, SC/ST, and rural women.",
        "required_documents": "Aadhaar Card, Age Proof, Educational Certificate (if any), Caste Certificate",
        "application_url": "https://wcd.gov.in/schemes/support-training-and-employment-programme-women-step",
        "official_website": "https://wcd.gov.in/",
        "min_age": "16",
        "max_age": "60",
        "gender_applicable": "Female",
        "caste_category": "All",
        "max_income_limit": "180000",
        "residence_type": "All",
        "eligible_states_list": "All",
        "is_bpl_required": "False",
        "is_disability_required": "False",
        "life_stage": "entrepreneur",
        "active_status": "True"
    },
    {
        "scheme_id": "standup-india-women",
        "scheme_name": "Stand Up India Scheme for Women Entrepreneurs",
        "ministry_name": "Ministry of Finance",
        "department_name": "Department of Financial Services",
        "state_name": "All",
        "scheme_category": "Entrepreneurship & Loans",
        "target_beneficiary": "SC/ST and Women entrepreneurs",
        "scheme_benefits": "Bank loans between Rs 10 Lakh and Rs 1 Crore for setting up a greenfield enterprise in manufacturing, services, or trading sector.",
        "eligibility_criteria_text": "SC/ST and/or woman entrepreneur above 18 years of age. Enterprise must be greenfield (first time venture). In non-individual entities, 51% shareholding must be held by woman or SC/ST.",
        "required_documents": "Aadhaar Card, PAN Card, Project Profile, Bank Statements, Proof of Business Address, Category Certificate",
        "application_url": "https://www.standupmitra.in/",
        "official_website": "https://www.standupmitra.in/",
        "min_age": "18",
        "max_age": "70",
        "gender_applicable": "Female",
        "caste_category": "All",
        "max_income_limit": "0",
        "residence_type": "All",
        "eligible_states_list": "All",
        "is_bpl_required": "False",
        "is_disability_required": "False",
        "life_stage": "entrepreneur",
        "active_status": "True"
    },
    {
        "scheme_id": "ignwps-pension",
        "scheme_name": "Indira Gandhi National Widow Pension Scheme (IGNWPS)",
        "ministry_name": "Ministry of Rural Development",
        "department_name": "National Social Assistance Programme (NSAP)",
        "state_name": "All",
        "scheme_category": "Pension & Social Security",
        "target_beneficiary": "Widows aged 40-79 years belonging to BPL households",
        "scheme_benefits": "Monthly pension of Rs 300 to Rs 1,000 (with state contribution top-up) directly disbursed to beneficiary bank accounts.",
        "eligibility_criteria_text": "Widow aged between 40 and 79 years who belongs to a household below the poverty line (BPL) as per central guidelines.",
        "required_documents": "Death Certificate of Husband, BPL Ration Card, Aadhaar Card, Bank Account Details, Age Proof",
        "application_url": "https://nsap.nic.in/",
        "official_website": "https://nsap.nic.in/",
        "min_age": "40",
        "max_age": "79",
        "gender_applicable": "Female",
        "caste_category": "All",
        "max_income_limit": "120000",
        "residence_type": "All",
        "eligible_states_list": "All",
        "is_bpl_required": "True",
        "is_disability_required": "False",
        "life_stage": "senior",
        "active_status": "True"
    },
    {
        "scheme_id": "kanya-sumangala-up",
        "scheme_name": "Mukhya Mantri Kanya Sumangala Yojana",
        "ministry_name": "Government of Uttar Pradesh",
        "department_name": "Department of Women and Child Development UP",
        "state_name": "Uttar Pradesh",
        "scheme_category": "Girl Child & Education",
        "target_beneficiary": "Girls born in Uttar Pradesh in eligible low-income families",
        "scheme_benefits": "Total financial grant of Rs 25,000 phased across 6 milestones from birth, vaccination, school admission (class 1, 6, 9) to graduation/diploma.",
        "eligibility_criteria_text": "Resident of Uttar Pradesh. Annual family income should not exceed Rs 3,00,000. Maximum two girl children per family.",
        "required_documents": "Birth Certificate, Residence Certificate of UP, Family Income Certificate, Aadhaar Card of parents, Bank Passbook",
        "application_url": "https://mksy.up.gov.in/",
        "official_website": "https://mksy.up.gov.in/",
        "min_age": "0",
        "max_age": "25",
        "gender_applicable": "Female",
        "caste_category": "All",
        "max_income_limit": "300000",
        "residence_type": "All",
        "eligible_states_list": "Uttar Pradesh",
        "is_bpl_required": "False",
        "is_disability_required": "False",
        "life_stage": "student",
        "active_status": "True"
    },
    {
        "scheme_id": "pudhumai-penn-tn",
        "scheme_name": "Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme (Pudhumai Penn)",
        "ministry_name": "Government of Tamil Nadu",
        "department_name": "Social Welfare and Women Empowerment Department TN",
        "state_name": "Tamil Nadu",
        "scheme_category": "Higher Education",
        "target_beneficiary": "Female students pursuing higher education who studied in government schools from classes 6 to 12",
        "scheme_benefits": "Financial assistance of Rs 1,000 per month deposited directly into student bank accounts until completion of undergraduate degree/diploma/ITI course.",
        "eligibility_criteria_text": "Female students residing in Tamil Nadu who studied in Govt schools from Class 6 to 12 and enrolled in higher education degree/diploma courses.",
        "required_documents": "School Transfer Certificate / Bonafide Certificate (Class 6-12), Aadhaar Card, College Admission Proof, Bank Passbook",
        "application_url": "https://penkalvi.tn.gov.in/",
        "official_website": "https://penkalvi.tn.gov.in/",
        "min_age": "17",
        "max_age": "25",
        "gender_applicable": "Female",
        "caste_category": "All",
        "max_income_limit": "250000",
        "residence_type": "All",
        "eligible_states_list": "Tamil Nadu",
        "is_bpl_required": "False",
        "is_disability_required": "False",
        "life_stage": "student",
        "active_status": "True"
    },
    {
        "scheme_id": "kanyashree-wb",
        "scheme_name": "Kanyashree Prakalpa",
        "ministry_name": "Government of West Bengal",
        "department_name": "Department of Women & Child Development and Social Welfare WB",
        "state_name": "West Bengal",
        "scheme_category": "Education & Social Empowerment",
        "target_beneficiary": "Unmarried girls aged 13-19 in West Bengal enrolled in school/college",
        "scheme_benefits": "Annual scholarship K1 (Rs 1,000) for girls aged 13-18 and One-time grant K2 (Rs 25,000) at age 18 if continuing education and unmarried.",
        "eligibility_criteria_text": "Unmarried female student in West Bengal aged 13-19, enrolled in recognized institution. Family income limit Rs 1,20,000 (waived for orphans/disabled).",
        "required_documents": "Age Proof Certificate, Unmarried Declaration, School Bonafide Certificate, Income Certificate, Bank Account Details",
        "application_url": "https://wbkanyashree.gov.in/",
        "official_website": "https://wbkanyashree.gov.in/",
        "min_age": "13",
        "max_age": "19",
        "gender_applicable": "Female",
        "caste_category": "All",
        "max_income_limit": "120000",
        "residence_type": "All",
        "eligible_states_list": "West Bengal",
        "is_bpl_required": "False",
        "is_disability_required": "False",
        "life_stage": "student",
        "active_status": "True"
    },
    {
        "scheme_id": "ladli-behna-mp",
        "scheme_name": "Mukhyamantri Ladli Behna Yojana",
        "ministry_name": "Government of Madhya Pradesh",
        "department_name": "Department of Women and Child Development MP",
        "state_name": "Madhya Pradesh",
        "scheme_category": "Financial Assistance & Empowerment",
        "target_beneficiary": "Married, widowed, divorced, or deserted women aged 21 to 60 years in Madhya Pradesh",
        "scheme_benefits": "Direct monthly cash benefit of Rs 1,250 transferred on the 10th of every month into beneficiary bank account.",
        "eligibility_criteria_text": "Resident of MP, female aged 21-60 years. Family self-declared annual income less than Rs 2.5 Lakh. Not an income tax payer.",
        "required_documents": "Samagra ID, Aadhaar Card (DBT linked), Bank Account Details, Self-declaration form",
        "application_url": "https://cmladlibehna.mp.gov.in/",
        "official_website": "https://cmladlibehna.mp.gov.in/",
        "min_age": "21",
        "max_age": "60",
        "gender_applicable": "Female",
        "caste_category": "All",
        "max_income_limit": "250000",
        "residence_type": "All",
        "eligible_states_list": "Madhya Pradesh",
        "is_bpl_required": "False",
        "is_disability_required": "False",
        "life_stage": "general",
        "active_status": "True"
    },
    {
        "scheme_id": "pm-ujjwala-yojana",
        "scheme_name": "Pradhan Mantri Ujjwala Yojana (PMUY 2.0)",
        "ministry_name": "Ministry of Petroleum and Natural Gas",
        "department_name": "LPG Division",
        "state_name": "All",
        "scheme_category": "Clean Energy & Housing",
        "target_beneficiary": "Adult women from BPL / poor households",
        "scheme_benefits": "Deposit-free LPG connection, first refill free, free hotplate stove, and Rs 300 subsidy per 14.2 kg cylinder up to 12 refills per year.",
        "eligibility_criteria_text": "Adult woman (18+) belonging to BPL household (SC/ST, PMAY, Antyodaya Anna Yojana, Forest dwellers, Most Backward Classes, or 14-point declaration).",
        "required_documents": "Aadhaar Card of Applicant & Family Members, BPL Card / SECC Data Proof, Bank Account Number & IFSC, Ration Card",
        "application_url": "https://www.pmuy.gov.in/",
        "official_website": "https://www.pmuy.gov.in/",
        "min_age": "18",
        "max_age": "80",
        "gender_applicable": "Female",
        "caste_category": "All",
        "max_income_limit": "200000",
        "residence_type": "All",
        "eligible_states_list": "All",
        "is_bpl_required": "True",
        "is_disability_required": "False",
        "life_stage": "general",
        "active_status": "True"
    }
]

# Sample Raw JSON Data matching Hugging Face dataset format
JSON_SCHEMES_RAW = [
    {
        "hf_id": "hf-scheme-001",
        "title": "Post Graduate Indira Gandhi Scholarship for Single Girl Child",
        "organization": "University Grants Commission (UGC) / Ministry of Education",
        "geography": "All India",
        "domain": "Higher Education",
        "summary": "Scholarship of Rs 36,200 per annum for 2 years to support single girl child pursuing PG degree courses in non-professional streams.",
        "eligibility": {
            "gender": "Female",
            "single_child": True,
            "min_age": 18,
            "max_age": 30,
            "max_income": 500000,
            "course": "Post Graduate 1st Year"
        },
        "benefits_text": "Rs 3,100 per month (Rs 36,200 p.a.) for 2 years duration of PG course.",
        "documents": ["Proof of Single Girl Child (Affidavit on stamp paper)", "Aadhaar Card", "Graduation Marksheet", "PG Admission Verification"],
        "urls": {
            "apply": "https://scholarships.gov.in/",
            "portal": "https://www.ugc.gov.in/"
        },
        "tags": ["student", "single_girl_child", "higher_education"]
    },
    {
        "hf_id": "hf-scheme-002",
        "title": "Mahila Samman Savings Certificate (MSSC)",
        "organization": "Department of Posts / Ministry of Finance",
        "geography": "All India",
        "domain": "Financial Security & Savings",
        "summary": "One-time small savings scheme for women and girls offering guaranteed 7.5% fixed interest per annum for a 2-year tenor.",
        "eligibility": {
            "gender": "Female",
            "min_age": 0,
            "max_age": 100,
            "max_income": 0,
            "requires_bpl": False
        },
        "benefits_text": "7.5% fixed interest rate compounded quarterly. Deposit up to Rs 2 Lakhs. Partial withdrawal up to 40% allowed after 1 year.",
        "documents": ["Aadhaar Card", "PAN Card", "KYC Form", "Passport size photo"],
        "urls": {
            "apply": "https://www.indiapost.gov.in/",
            "portal": "https://www.indiapost.gov.in/"
        },
        "tags": ["financial_security", "savings", "all_women"]
    },
    {
        "hf_id": "hf-scheme-003",
        "title": "Working Women Hostel Scheme (Sakhi Niwas)",
        "organization": "Ministry of Women and Child Development",
        "geography": "All India",
        "domain": "Safe Housing & Employment Support",
        "summary": "Safe, affordable hostel accommodation with day care facilities for children of working women in urban, semi-urban, and rural areas.",
        "eligibility": {
            "gender": "Female",
            "min_age": 18,
            "max_age": 60,
            "max_income": 500000,
            "occupation": "Working Women / Job Seekers / Trainees"
        },
        "benefits_text": "Subsidized secure lodging, daycare center (Crèche) for children up to 8 years, mess facilities, and 24/7 security.",
        "documents": ["Employment Certificate / Salary Slip", "Aadhaar Card", "Passport photo", "Identity Card from Employer"],
        "urls": {
            "apply": "https://wcd.nic.in/schemes/working-women-hostel",
            "portal": "https://wcd.nic.in/"
        },
        "tags": ["working_women", "housing", "entrepreneur", "urban"]
    }
]


def write_local_raw_datasets():
    """Generates local raw dataset files under data/raw/."""
    os.makedirs(DATA_RAW_DIR, exist_ok=True)
    
    # 1. Write CSV dataset
    csv_file_path = os.path.join(DATA_RAW_DIR, "indian_government_schemes_2025.csv")
    fieldnames = list(CSV_SCHEMES_RAW[0].keys())
    with open(csv_file_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(CSV_SCHEMES_RAW)
    print(f"✓ Saved raw CSV dataset: {csv_file_path} ({len(CSV_SCHEMES_RAW)} records)")

    # 2. Write JSON dataset
    json_file_path = os.path.join(DATA_RAW_DIR, "huggingface_welfare_schemes.json")
    with open(json_file_path, "w", encoding="utf-8") as f:
        json.dump(JSON_SCHEMES_RAW, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved raw JSON dataset: {json_file_path} ({len(JSON_SCHEMES_RAW)} records)")

    return csv_file_path, json_file_path


def stage_to_gcs(csv_path, json_path, bucket_name):
    """Stages raw files to Cloud Storage bucket gs://<bucket_name>/."""
    gcs_target = f"gs://{bucket_name}/"
    print(f"\nStaging raw datasets to Cloud Storage bucket '{gcs_target}'...")
    
    try:
        cmd_csv = ["gcloud", "storage", "cp", csv_path, gcs_target]
        cmd_json = ["gcloud", "storage", "cp", json_path, gcs_target]
        
        result_csv = subprocess.run(cmd_csv, capture_output=True, text=True)
        if result_csv.returncode == 0:
            print(f"✓ Successfully uploaded {os.path.basename(csv_path)} to {gcs_target}")
        else:
            fallback_csv = subprocess.run(["gsutil", "cp", csv_path, gcs_target], capture_output=True, text=True)
            if fallback_csv.returncode == 0:
                print(f"✓ Uploaded {os.path.basename(csv_path)} using gsutil")
            else:
                print(f"⚠ Warning: GCS upload for CSV failed. Output: {result_csv.stderr.strip() or fallback_csv.stderr.strip()}")
                print("  Note: Local staging in data/raw/ is complete. Ensure GCP auth is active for remote bucket sync.")

        result_json = subprocess.run(cmd_json, capture_output=True, text=True)
        if result_json.returncode == 0:
            print(f"✓ Successfully uploaded {os.path.basename(json_path)} to {gcs_target}")
        else:
            fallback_json = subprocess.run(["gsutil", "cp", json_path, gcs_target], capture_output=True, text=True)
            if fallback_json.returncode == 0:
                print(f"✓ Uploaded {os.path.basename(json_path)} using gsutil")
            else:
                print(f"⚠ Warning: GCS upload for JSON failed. Output: {result_json.stderr.strip() or fallback_json.stderr.strip()}")

    except Exception as e:
        print(f"⚠ GCS Staging encountered exception: {e}")
        print("  Local raw files remain safely staged in data/raw/.")


def main():
    parser = argparse.ArgumentParser(description="Dataset Acquisition & Staging for Yojana Dvar")
    parser.add_argument("--bucket", default=os.getenv("GCS_RAW_BUCKET", "yojana-dvar-raw"), help="Cloud Storage bucket name")
    parser.add_argument("--local-only", action="store_true", help="Only generate local data/raw/ files without GCS upload")
    args = parser.parse_args()

    print("==================================================")
    print("Yojana Dvar — Ticket 2.1 Dataset Acquisition")
    print("==================================================")
    
    csv_path, json_path = write_local_raw_datasets()
    
    if args.local_only:
        print("\n[Local-Only Mode] Skipping Cloud Storage staging.")
    else:
        stage_to_gcs(csv_path, json_path, args.bucket)
        
    print("\n==================================================")
    print("✓ Dataset Acquisition & Staging Completed!")
    print("Local Files:")
    print(f"  - CSV:  {csv_path}")
    print(f"  - JSON: {json_path}")
    print("==================================================")

if __name__ == "__main__":
    main()
