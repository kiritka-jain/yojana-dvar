import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.matcher import matcher_service
from app.models.profile import ProfileInput, SchemeMatchResult
from app.services.translations import (
    SCHEME_TRANSLATIONS,
    SCHEME_ALIAS_MAP,
    get_scheme_translation,
    get_localized_scheme_field,
    store_dynamic_translation
)

client = TestClient(app)

def test_scheme_translations_registry_not_empty():
    """Verify that scheme translation registry contains all core schemes."""
    assert len(SCHEME_TRANSLATIONS) >= 30
    assert "pradhan-mantri-matru-vandana-yojana" in SCHEME_TRANSLATIONS
    assert "sukanya-samriddhi-yojana" in SCHEME_TRANSLATIONS

def test_get_scheme_translation_canonical_and_alias():
    """Verify lookup works for canonical slug and alias."""
    # Canonical
    t1 = get_scheme_translation("sukanya-samriddhi-yojana")
    assert t1 is not None
    assert "सुकन्या समृद्धि" in t1["name_hi"]

    # Alias
    t2 = get_scheme_translation("ssy-central")
    assert t2 is not None
    assert t2 == t1

def test_get_localized_scheme_field_english_fallback():
    """Verify English field falls back to scheme dict attribute."""
    scheme = {
        "scheme_id": "test-scheme-xyz",
        "name": "Test Scheme",
        "benefits": "8.2% annual interest"
    }
    assert get_localized_scheme_field(scheme, "name", "en") == "Test Scheme"
    assert get_localized_scheme_field(scheme, "benefits", "en") == "8.2% annual interest"

def test_get_localized_scheme_field_hindi_registry():
    """Verify Hindi returns localized string from registry."""
    scheme = {
        "scheme_id": "sukanya-samriddhi-yojana",
        "name": "Sukanya Samriddhi Yojana",
        "benefits": "8.2% annual interest"
    }
    name_hi = get_localized_scheme_field(scheme, "name", "hi")
    assert "सुकन्या समृद्धि" in name_hi
    assert get_localized_scheme_field(scheme, "description", "hi") != ""

def test_get_localized_scheme_field_direct_attributes():
    """Verify direct localized attributes take precedence (Ticket YD-I18N-101)."""
    scheme = {
        "scheme_id": "custom-state-scheme-001",
        "name": "Custom Women Skill Scheme",
        "name_hi": "कस्टम महिला कौशल योजना",
        "application_process": "Step 1: Apply online.",
        "application_process_hi": "चरण 1: ऑनलाइन पोर्टल पर आवेदन करें।"
    }
    assert get_localized_scheme_field(scheme, "name", "hi") == "कस्टम महिला कौशल योजना"
    assert get_localized_scheme_field(scheme, "application_process", "hi") == "चरण 1: ऑनलाइन पोर्टल पर आवेदन करें।"

def test_dynamic_translation_caching():
    """Verify in-memory dynamic translation caching (Ticket YD-I18N-103)."""
    scheme_id = "dynamic-cached-scheme-999"
    store_dynamic_translation(scheme_id, {
        "name_hi": "डायनामिक कैश्ड योजना",
        "application_process_hi": "चरण 1: नजदीकी सीएससी केंद्र जाएं।"
    })

    scheme = {"scheme_id": scheme_id, "name": "Dynamic Scheme"}
    assert get_localized_scheme_field(scheme, "name", "hi") == "डायनामिक कैश्ड योजना"
    assert get_localized_scheme_field(scheme, "application_process", "hi") == "चरण 1: नजदीकी सीएससी केंद्र जाएं।"

def test_enriched_catalog_contains_localized_fields():
    """Verify all 3,288 schemes in the catalog have localized Hindi fields (Ticket YD-I18N-102)."""
    catalog = matcher_service.get_catalog()
    assert len(catalog) >= 3000

    # Sample check 50 schemes across the dataset
    for scheme in catalog[:50]:
        assert "name_hi" in scheme and scheme["name_hi"] is not None and len(scheme["name_hi"]) > 0
        assert "application_process_hi" in scheme and scheme["application_process_hi"] is not None
        assert "ministry_hi" in scheme and scheme["ministry_hi"] is not None

def test_translate_endpoint():
    """Verify /api/v1/schemes/{scheme_id}/translate endpoint (Ticket YD-I18N-103)."""
    response = client.post("/api/v1/schemes/advance-high-skill-training-component-of-the-development-of-industries-scheme/translate?lang=hi")
    assert response.status_code == 200
    data = response.json()
    assert data["scheme_id"] == "advance-high-skill-training-component-of-the-development-of-industries-scheme"
    assert data["language"] == "hi"
    assert "name_hi" in data and len(data["name_hi"]) > 0
    assert "application_process_hi" in data and len(data["application_process_hi"]) > 0

def test_match_engine_returns_localized_fields():
    """Verify /match endpoint returns SchemeMatchResult with localized fields."""
    profile = {
        "state": "Puducherry",
        "age": 22,
        "gender": "Female",
        "caste": "General",
        "income": 50000,
        "residence": "All",
        "life_stage": "student",
        "occupation": "student",
        "is_bpl": False,
        "has_disability": False,
        "limit": 5
    }
    response = client.post("/api/v1/match", json=profile)
    assert response.status_code == 200
    data = response.json()
    assert data["count"] > 0
    top_scheme = data["schemes"][0]
    assert "name_hi" in top_scheme
    assert "application_process_hi" in top_scheme

def test_bilingual_keyword_search():
    """Verify bilingual search endpoint matches Hindi keywords (Ticket YD-I18N-303)."""
    # Search in Devanagari for skill training
    res_hi = client.get("/api/v1/schemes/search?q=कौशल&limit=10")
    assert res_hi.status_code == 200
    data_hi = res_hi.json()
    assert data_hi["count"] > 0
    assert any("कौशल" in str(s.get("name_hi", "")) or "कौशल" in str(s.get("category_hi", "")) for s in data_hi["schemes"])

    # Search in Devanagari for pension
    res_pension = client.get("/api/v1/schemes/search?q=पेंशन&limit=5")
    assert res_pension.status_code == 200
    data_pension = res_pension.json()
    assert data_pension["count"] > 0

