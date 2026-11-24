"""Backend API tests using isolated in-memory state."""
from copy import deepcopy

import pytest
from fastapi.testclient import TestClient

from src.app import app, activities

client = TestClient(app)
original = deepcopy(activities)


@pytest.fixture(autouse=True)
def reset_activities():
    activities.clear()
    activities.update(deepcopy(original))
    yield
    activities.clear()
    activities.update(deepcopy(original))


def test_root_redirects():
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/static/index.html"


def test_list_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 9
    assert "Chess Club" in data
    assert "Science Club" in data


def test_signup():
    email = "test@example.test"
    response = client.post("/activities/Chess Club/signup", params={"email": email})
    assert response.status_code == 200
    assert email in activities["Chess Club"]["participants"]


def test_duplicate_signup():
    email = activities["Chess Club"]["participants"][0]
    before = activities["Chess Club"]["participants"].copy()
    response = client.post("/activities/Chess Club/signup", params={"email": email})
    assert response.status_code == 400
    assert activities["Chess Club"]["participants"] == before


def test_signup_unknown_activity():
    response = client.post("/activities/Unknown/signup", params={"email": "test@example.test"})
    assert response.status_code == 404


def test_unregister():
    email = activities["Chess Club"]["participants"][0]
    response = client.delete("/activities/Chess Club/unregister", params={"email": email})
    assert response.status_code == 200
    assert email not in client.get("/activities").json()["Chess Club"]["participants"]


def test_unregister_unknown_activity():
    response = client.delete("/activities/Unknown/unregister", params={"email": "test@example.test"})
    assert response.status_code == 404


def test_unregister_unknown_participant():
    response = client.delete("/activities/Chess Club/unregister", params={"email": "missing@example.test"})
    assert response.status_code == 404


def test_missing_email():
    assert client.post("/activities/Chess Club/signup").status_code == 422


def test_signup_unregister_roundtrip():
    email = "roundtrip@example.test"
    assert client.post("/activities/Science Club/signup", params={"email": email}).status_code == 200
    assert email in client.get("/activities").json()["Science Club"]["participants"]
    assert client.delete("/activities/Science Club/unregister", params={"email": email}).status_code == 200
    assert email not in client.get("/activities").json()["Science Club"]["participants"]
