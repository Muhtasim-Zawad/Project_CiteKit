# tests/test_project_routes.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

# ------------------------------
# Mock JWT user
# ------------------------------
mock_user = {"id": "user-123", "email": "test@example.com", "name": "Test User"}

# ------------------------------
# Fixtures
# ------------------------------
@pytest.fixture
def project_data():
    return {"title": "My Test Project"}

@pytest.fixture
def reference_data():
    return {
        "doi": "10.1234/exampledoi",
        "title": "Sample Reference",
        "author": "Author Name",
        "abstract": "Some abstract text"
    }

# ------------------------------
# Patch authentication
# ------------------------------
@pytest.fixture(autouse=True)
def mock_auth():
    # Patch get_current_user where your project routes actually import it
    with patch("app.routers.project.get_current_user", return_value=mock_user):
        yield

# ------------------------------
# Helper to create a project
# ------------------------------
def create_project(client, project_data):
    resp = client.post("/projects", json=project_data)
    assert resp.status_code == 201, f"Failed to create project: {resp.text}"
    return resp.json()

# ------------------------------
# Project Tests
# ------------------------------
def test_create_project(project_data):
    data = create_project(client, project_data)
    assert data["title"] == project_data["title"]
    assert data["user_id"] == mock_user["id"]
    assert "project_id" in data
    assert "created_at" in data
    assert "updated_at" in data

def test_delete_project(project_data):
    project = create_project(client, project_data)
    project_id = project["project_id"]

    del_resp = client.delete(f"/projects/{project_id}")
    assert del_resp.status_code == 200
    assert "message" in del_resp.json()
    assert del_resp.json()["message"].lower().startswith("project deleted")

# ------------------------------
# Reference Tests
# ------------------------------
def test_add_reference(project_data, reference_data):
    project = create_project(client, project_data)
    project_id = project["project_id"]

    ref_resp = client.post(f"/projects/{project_id}/references", json=reference_data)
    assert ref_resp.status_code == 201
    data = ref_resp.json()
    assert data["doi"] == reference_data["doi"]
    assert data["title"] == reference_data["title"]
    assert "add_time" in data

def test_delete_reference(project_data, reference_data):
    project = create_project(client, project_data)
    project_id = project["project_id"]

    # Add reference first
    ref_resp = client.post(f"/projects/{project_id}/references", json=reference_data)
    doi = ref_resp.json()["doi"]

    del_resp = client.delete(f"/projects/{project_id}/references/{doi}")
    assert del_resp.status_code == 200
    assert "message" in del_resp.json()
    assert del_resp.json()["message"].lower().startswith("reference deleted")
