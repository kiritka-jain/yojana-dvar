from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_auth_me_unauthenticated():
    """
    Acceptance Criteria (Ticket 5.1):
    Unauthenticated requests to protected endpoints return 401.
    """
    response = client.get("/auth/me")
    assert response.status_code == 401
    assert "Missing Authorization" in response.json()["detail"]

def test_auth_me_invalid_token():
    """
    Verify invalid bearer token returns 401.
    """
    headers = {"Authorization": "Bearer invalid.jwt.token"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 401
    assert "Invalid or expired" in response.json()["detail"]

def test_auth_me_dev_authenticated_user():
    """
    Acceptance Criteria (Ticket 5.1):
    Valid token injects uid and user profile.
    """
    headers = {"Authorization": "Bearer dev-token-user-12345"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["uid"] == "user-12345"
    assert data["email"] == "user-12345@example.com"
    assert data["is_anonymous"] is False
    assert data["auth_provider"] == "google.com"

def test_auth_me_anonymous_session_user():
    """
    Acceptance Criteria (Ticket 5.1):
    Support anonymous session tokens with is_anonymous=True.
    """
    headers = {"Authorization": "Bearer anon-token-guest-98765"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["uid"] == "guest-98765"
    assert data["is_anonymous"] is True
    assert data["auth_provider"] == "anonymous"

def test_auth_me_with_mocked_firebase_verify():
    """
    Verify real Firebase verify_id_token call path.
    """
    mock_payload = {
        "uid": "google-uid-777",
        "email": "sunita@example.com",
        "firebase": {"sign_in_provider": "google.com"}
    }
    with patch("firebase_admin.auth.verify_id_token", return_value=mock_payload):
        headers = {"Authorization": "Bearer live.firebase.jwt.token"}
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["uid"] == "google-uid-777"
        assert data["email"] == "sunita@example.com"
        assert data["is_anonymous"] is False
