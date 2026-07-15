from tests.conftest import auth_headers


def _mark_full_roster(client, headers, class_id, student_ids, date_str, status="present"):
    entries = [{"student_id": sid, "status": status} for sid in student_ids]
    return client.post("/v1/attendance", json={"class_id": class_id, "date": date_str, "entries": entries}, headers=headers)


def test_mark_attendance_success(client, seeded_class):
    headers = auth_headers(client, seeded_class["email"], seeded_class["password"])
    resp = _mark_full_roster(client, headers, seeded_class["class_id"], seeded_class["student_ids"], "2026-01-01")
    assert resp.status_code == 201
    body = resp.json()
    assert body["success"] is True
    assert len(body["data"]) == 3


def test_duplicate_attendance_rejected(client, seeded_class):
    headers = auth_headers(client, seeded_class["email"], seeded_class["password"])
    _mark_full_roster(client, headers, seeded_class["class_id"], seeded_class["student_ids"], "2026-01-01")
    resp = _mark_full_roster(client, headers, seeded_class["class_id"], seeded_class["student_ids"], "2026-01-01")
    assert resp.status_code == 409
    assert resp.json()["success"] is False


def test_incomplete_roster_rejected(client, seeded_class):
    headers = auth_headers(client, seeded_class["email"], seeded_class["password"])
    partial_ids = seeded_class["student_ids"][:1]  # only 1 of 3 students
    resp = _mark_full_roster(client, headers, seeded_class["class_id"], partial_ids, "2026-01-01")
    assert resp.status_code == 422


def test_future_date_rejected(client, seeded_class):
    headers = auth_headers(client, seeded_class["email"], seeded_class["password"])
    resp = _mark_full_roster(client, headers, seeded_class["class_id"], seeded_class["student_ids"], "2099-01-01")
    assert resp.status_code == 422


def test_get_attendance_after_marking(client, seeded_class):
    headers = auth_headers(client, seeded_class["email"], seeded_class["password"])
    _mark_full_roster(client, headers, seeded_class["class_id"], seeded_class["student_ids"], "2026-01-01")
    resp = client.get(f"/v1/attendance?class_id={seeded_class['class_id']}&date=2026-01-01", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()["data"]["records"]) == 3


def test_update_attendance_record(client, seeded_class):
    headers = auth_headers(client, seeded_class["email"], seeded_class["password"])
    mark_resp = _mark_full_roster(client, headers, seeded_class["class_id"], seeded_class["student_ids"], "2026-01-01")
    record_id = mark_resp.json()["data"][0]["id"]

    resp = client.put(f"/v1/attendance/{record_id}", json={"status": "absent", "remarks": "Called in sick"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "absent"


def test_delete_attendance_record(client, seeded_class):
    headers = auth_headers(client, seeded_class["email"], seeded_class["password"])
    mark_resp = _mark_full_roster(client, headers, seeded_class["class_id"], seeded_class["student_ids"], "2026-01-01")
    record_id = mark_resp.json()["data"][0]["id"]

    resp = client.delete(f"/v1/attendance/{record_id}", headers=headers)
    assert resp.status_code == 200


def test_attendance_without_auth_rejected(client, seeded_class):
    resp = _mark_full_roster(client, {}, seeded_class["class_id"], seeded_class["student_ids"], "2026-01-01")
    assert resp.status_code == 401
