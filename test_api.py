import pytest
import sys
sys.path.insert(0, 'server')
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_admin():
    response = client.post("/api/auth/login", json={
        "email": "admin@whitevolunteers.org",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["total_students"] >= 8
    assert "level_distribution" in data

def test_students_and_detail():
    response = client.get("/api/students")
    assert response.status_code == 200
    students = response.json()
    assert len(students) >= 8

    # Detail check
    first_id = students[0]["id"]
    det_resp = client.get(f"/api/students/{first_id}")
    assert det_resp.status_code == 200
    detail = det_resp.json()
    assert "attendance" in detail
    assert "skills" in detail
    assert "learning_history" in detail

def test_ai_recommendation():
    response = client.get("/api/ai/recommend-level/1")
    assert response.status_code == 200
    data = response.json()
    assert "recommended_level" in data
    assert "rationale" in data
