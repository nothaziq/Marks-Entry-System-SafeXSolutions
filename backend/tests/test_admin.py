from tests.conftest import auth_headers


def test_trigger_reminders_rejects_non_admin(client, seeded_class):
    headers = auth_headers(client, seeded_class["email"], seeded_class["password"])
    resp = client.post("/v1/admin/trigger-reminders", headers=headers)
    assert resp.status_code == 403
    assert resp.json()["success"] is False


def test_trigger_reminders_allows_admin(client, seeded_class, admin_teacher):
    headers = auth_headers(client, admin_teacher["email"], admin_teacher["password"])
    resp = client.post("/v1/admin/trigger-reminders", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "emails_sent" in body["data"]


def test_trigger_reminders_requires_auth(client):
    resp = client.post("/v1/admin/trigger-reminders")
    assert resp.status_code == 401
