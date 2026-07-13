def test_login_success(client, seeded_class):
    resp = client.post("/login", json={"email": "teacher@test.com", "password": "secret123"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "access_token" in body["data"]


def test_login_wrong_password(client, seeded_class):
    resp = client.post("/login", json={"email": "teacher@test.com", "password": "wrong"})
    assert resp.status_code == 401
    assert resp.json()["success"] is False


def test_profile_requires_auth(client, seeded_class):
    resp = client.get("/profile")
    assert resp.status_code == 401


def test_profile_with_valid_token(client, seeded_class):
    from tests.conftest import auth_headers
    headers = auth_headers(client, "teacher@test.com", "secret123")
    resp = client.get("/profile", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["email"] == "teacher@test.com"
