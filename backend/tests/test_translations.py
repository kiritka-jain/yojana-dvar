import pytest
from app.services.translations import (
    SCHEME_TRANSLATIONS,
    SCHEME_ALIAS_MAP,
    get_scheme_translation,
    get_localized_scheme_field
)

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
        "scheme_id": "sukanya-samriddhi-yojana",
        "name": "Sukanya Samriddhi Yojana",
        "benefits": "8.2% annual interest"
    }
    assert get_localized_scheme_field(scheme, "name", "en") == "Sukanya Samriddhi Yojana"
    assert get_localized_scheme_field(scheme, "benefits", "en") == "8.2% annual interest"

def test_get_localized_scheme_field_hindi():
    """Verify Hindi returns localized string from registry."""
    scheme = {
        "scheme_id": "sukanya-samriddhi-yojana",
        "name": "Sukanya Samriddhi Yojana",
        "benefits": "8.2% annual interest"
    }
    name_hi = get_localized_scheme_field(scheme, "name", "hi")
    assert "सुकन्या समृद्धि" in name_hi
    assert get_localized_scheme_field(scheme, "description", "hi") != ""
