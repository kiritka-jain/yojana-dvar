from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Verify GET /health returns HTTP 200 { 'status': 'ok', 'version': '1.0' }."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0"
    assert "uptime_seconds" in data
    assert "timestamp" in data

def test_api_v1_health_endpoint():
    """Verify GET /api/v1/health returns HTTP 200."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0"
