from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

AUTH_HEADER_USER1 = {"Authorization": "Bearer dev-token-user-endpoint-1"}
AUTH_HEADER_USER2 = {"Authorization": "Bearer dev-token-user-endpoint-2"}

SAMPLE_PROFILE = {
    "profile": {
        "state": "Uttar Pradesh",
        "age": 22,
        "gender": "Female",
        "caste": "General",
        "income": 100000,
        "residence": "Urban",
        "life_stage": "student",
        "is_bpl": False,
        "has_disability": False
    },
    "profile_id": "default"
}

def test_unauthenticated_requests_return_401():
    """
    Acceptance Criteria (Ticket 5.3):
    401 on unauthenticated access across all profile and bookmark endpoints.
    """
    endpoints = [
        ("POST", "/user/profile", SAMPLE_PROFILE),
        ("GET", "/user/profile", None),
        ("POST", "/user/bookmarks", {"scheme_id": "pmmvy-central"}),
        ("GET", "/user/bookmarks", None),
        ("DELETE", "/user/bookmarks/pmmvy-central", None),
    ]

    for method, path, payload in endpoints:
        if method == "POST":
            res = client.post(path, json=payload)
        elif method == "GET":
            res = client.get(path)
        elif method == "DELETE":
            res = client.delete(path)
        assert res.status_code == 401, f"Expected 401 for {method} {path}, got {res.status_code}"

def test_profile_save_and_retrieve():
    """
    Acceptance Criteria (Ticket 5.3):
    Authenticated user can save profile and retrieve it.
    """
    # 1. Save profile
    save_res = client.post("/user/profile", json=SAMPLE_PROFILE, headers=AUTH_HEADER_USER1)
    assert save_res.status_code == 200
    save_data = save_res.json()
    assert save_data["status"] == "success"
    assert save_data["profile"]["state"] == "Uttar Pradesh"
    assert save_data["profile"]["age"] == 22

    # 2. Retrieve profile
    get_res = client.get("/user/profile", headers=AUTH_HEADER_USER1)
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["profile"]["uid"] == "user-endpoint-1"
    assert get_data["profile"]["state"] == "Uttar Pradesh"

    # Also test /api/v1 prefix
    get_v1 = client.get("/api/v1/user/profile", headers=AUTH_HEADER_USER1)
    assert get_v1.status_code == 200

def test_profile_not_found():
    """
    Verify 404 when profile does not exist.
    """
    res = client.get("/user/profile?profile_id=nonexistent", headers=AUTH_HEADER_USER1)
    assert res.status_code == 404

def test_bookmark_lifecycle_and_enrichment():
    """
    Acceptance Criteria (Ticket 5.3):
    Authenticated user can bookmark schemes, list them with metadata, and delete them.
    """
    scheme_id = "pmmvy-central"

    # 1. Save bookmark
    add_res = client.post("/user/bookmarks", json={"scheme_id": scheme_id}, headers=AUTH_HEADER_USER1)
    assert add_res.status_code == 200
    add_data = add_res.json()
    assert add_data["status"] == "success"
    assert add_data["bookmark"]["scheme_id"] == scheme_id

    # 2. List bookmarks (enriched with catalog metadata)
    list_res = client.get("/user/bookmarks", headers=AUTH_HEADER_USER1)
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["count"] >= 1
    
    # Check that scheme catalog metadata is attached
    bookmarked_items = [b for b in list_data["bookmarks"] if b["scheme_id"] == scheme_id]
    assert len(bookmarked_items) == 1
    item = bookmarked_items[0]
    assert item["scheme"] is not None
    assert "Pradhan Mantri Matru Vandana Yojana" in item["scheme"]["name"]
    assert "Maternal" in item["scheme"]["category"]

    # 3. Delete bookmark
    del_res = client.delete(f"/user/bookmarks/{scheme_id}", headers=AUTH_HEADER_USER1)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    # 4. Verify bookmark removed
    list_after = client.get("/user/bookmarks", headers=AUTH_HEADER_USER1)
    assert list_after.status_code == 200
    remaining = [b for b in list_after.json()["bookmarks"] if b["scheme_id"] == scheme_id]
    assert len(remaining) == 0

def test_cross_user_isolation():
    """
    Verify strict user isolation between user 1 and user 2.
    """
    # User 2 should not see User 1's profile
    res = client.get("/user/profile", headers=AUTH_HEADER_USER2)
    assert res.status_code == 404

    # User 2 adds a bookmark for SSY
    client.post("/user/bookmarks", json={"scheme_id": "ssy-central"}, headers=AUTH_HEADER_USER2)

    # User 1 lists bookmarks -> should NOT see User 2's bookmark
    user1_bookmarks = client.get("/user/bookmarks", headers=AUTH_HEADER_USER1).json()
    user1_scheme_ids = [b["scheme_id"] for b in user1_bookmarks["bookmarks"]]
    assert "ssy-central" not in user1_scheme_ids
