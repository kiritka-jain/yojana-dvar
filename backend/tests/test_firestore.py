import pytest
from app.services.firestore import FirestoreService

@pytest.fixture
def service():
    """Returns a fresh FirestoreService instance for testing."""
    return FirestoreService()

def test_profile_lifecycle(service):
    """
    Acceptance Criteria (Ticket 5.2):
    Profile operations (users/{uid}/profiles/{profileId}): create, get, update, delete.
    """
    uid = "test-user-1"
    profile_id = "default"
    profile_data = {
        "state": "Karnataka",
        "age": 19,
        "gender": "Female",
        "caste": "OBC",
        "income": 180000,
        "life_stage": "student"
    }

    # 1. Save Profile
    saved = service.save_profile(uid, profile_id, profile_data)
    assert saved["profile_id"] == profile_id
    assert saved["uid"] == uid
    assert saved["age"] == 19
    assert "created_at" in saved
    assert "updated_at" in saved

    # 2. Get Profile
    retrieved = service.get_profile(uid, profile_id)
    assert retrieved is not None
    assert retrieved["state"] == "Karnataka"

    # 3. List Profiles
    profiles = service.list_profiles(uid)
    assert len(profiles) == 1
    assert profiles[0]["profile_id"] == profile_id

    # 4. Update Profile
    updated = service.update_profile(uid, profile_id, {"income": 200000, "age": 20})
    assert updated is not None
    assert updated["income"] == 200000
    assert updated["age"] == 20
    assert updated["state"] == "Karnataka"

    # 5. Delete Profile
    assert service.delete_profile(uid, profile_id) is True
    assert service.get_profile(uid, profile_id) is None
    assert len(service.list_profiles(uid)) == 0

def test_bookmark_lifecycle(service):
    """
    Acceptance Criteria (Ticket 5.2):
    Bookmark operations (users/{uid}/bookmarks/{schemeId}): add, list, delete, check.
    """
    uid = "test-user-2"
    scheme_id = "pmmvy-central"
    meta = {"name": "Pradhan Mantri Matru Vandana Yojana", "category": "Maternal"}

    # 1. Check before bookmarking
    assert service.is_bookmarked(uid, scheme_id) is False
    assert service.get_bookmark(uid, scheme_id) is None

    # 2. Add Bookmark
    saved = service.add_bookmark(uid, scheme_id, meta)
    assert saved["scheme_id"] == scheme_id
    assert saved["uid"] == uid
    assert saved["metadata"]["category"] == "Maternal"
    assert "created_at" in saved

    # 3. Verify Bookmarked
    assert service.is_bookmarked(uid, scheme_id) is True
    assert service.get_bookmark(uid, scheme_id) is not None

    # 4. List Bookmarks
    bookmarks = service.list_bookmarks(uid)
    assert len(bookmarks) == 1
    assert bookmarks[0]["scheme_id"] == scheme_id

    # 5. Delete Bookmark
    assert service.delete_bookmark(uid, scheme_id) is True
    assert service.is_bookmarked(uid, scheme_id) is False
    assert len(service.list_bookmarks(uid)) == 0
    assert service.delete_bookmark(uid, scheme_id) is False

def test_user_data_isolation(service):
    """
    Verify multi-tenant data isolation: user-A data cannot be seen or accessed by user-B.
    """
    user_a = "user-alpha"
    user_b = "user-beta"

    service.save_profile(user_a, "prof-1", {"age": 25, "state": "Delhi"})
    service.add_bookmark(user_a, "scheme-alpha", {"name": "Alpha Scheme"})

    # User B should have empty profiles and bookmarks
    assert service.get_profile(user_b, "prof-1") is None
    assert len(service.list_profiles(user_b)) == 0
    assert service.is_bookmarked(user_b, "scheme-alpha") is False
    assert len(service.list_bookmarks(user_b)) == 0

def test_nonexistent_lookups_clean_handling(service):
    """
    Verify clean error handling on nonexistent lookups.
    """
    assert service.get_profile("nonexistent-user", "nonexistent-profile") is None
    assert service.update_profile("nonexistent-user", "nonexistent-profile", {"age": 30}) is None
    assert service.delete_profile("nonexistent-user", "nonexistent-profile") is False
    assert service.get_bookmark("nonexistent-user", "nonexistent-scheme") is None
    assert service.delete_bookmark("nonexistent-user", "nonexistent-scheme") is False
