# Attendance Module (Teacher Side) — Backend

**Project:** Marks Entry System — SafeX Solutions
**Team:** Group 22
**Developer:** Muhammad Haziq (242242)
**Module:** Attendance Module (Teacher Side) — Individual Week 2 Contribution

This is the backend API for the teacher-side attendance feature: teachers log in, view their
classes and rosters, mark attendance for a whole class in one submission, and edit or delete
individual records afterward.

Built with **FastAPI + SQLAlchemy 2.0 + PostgreSQL**, following the layered architecture
(API → Service → Repository → Database) defined in `Architecture.md`.

---

## 1. Architecture at a glance

```
Presentation  → FastAPI routers (app/api/v1/endpoints)
Application   → Pydantic schemas (app/schemas) — request/response validation
Business Logic→ Services (app/services) — ownership checks, duplicate prevention, roster rules
Data Access   → Repositories (app/repositories) — all SQL lives here
Database      → PostgreSQL, via SQLAlchemy models (app/models)
```

No SQL exists in the service layer, and no business rules live in the repository layer —
each layer has one job, matching the "Folder Dependency Rules" in `Architecture.md` §16.

### Business rules enforced (Architecture.md §11)
- A class must exist, and the teacher must own it (admins can access any class).
- Attendance dates cannot be in the future.
- Every student on the roster must be given a status before a submission is accepted.
- A class cannot have two attendance submissions for the same date (use `PUT` to edit
  individual records instead of resubmitting).

All of the above were tested end-to-end against a real PostgreSQL instance during
development — not just unit-tested against SQLite.

---

## 2. Project structure

```
backend/
├── app/
│   ├── api/v1/endpoints/   # auth.py, classes.py, attendance.py
│   ├── api/deps.py         # DB session + JWT auth dependency
│   ├── core/                # config.py, security.py (JWT + bcrypt)
│   ├── database/            # base.py, session.py
│   ├── middleware/           # global exception -> JSON error handler
│   ├── models/               # SQLAlchemy models
│   ├── repositories/         # CRUD + queries, no business logic
│   ├── schemas/               # Pydantic request/response models
│   ├── services/               # business rules, ownership checks
│   ├── utils/                   # small response helpers
│   └── main.py                  # app entrypoint
├── alembic/                       # migrations
├── tests/                          # pytest suite (12 tests, all passing)
├── seed.py                         # demo data loader
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## 3. Running it — Option A: Docker (recommended, fastest)

Requires Docker + Docker Compose installed.

```bash
cd backend
docker compose up --build
```

This starts PostgreSQL, runs migrations automatically, and starts the API on
`http://localhost:8000`. Then seed demo data:

```bash
docker compose exec api python seed.py
```

Open `http://localhost:8000/docs` for interactive Swagger UI.

---

## 4. Running it — Option B: Local Python + local PostgreSQL

**Prerequisites:** Python 3.12+, PostgreSQL 14+ running locally.

```bash
# 1. Create and activate a virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create the database (adjust credentials as needed)
psql -U postgres -c "CREATE USER attendance_user WITH PASSWORD 'attendance_pass';"
psql -U postgres -c "CREATE DATABASE attendance_db OWNER attendance_user;"

# 4. Configure environment
cp .env.example .env
# edit .env if your DB credentials differ from the defaults

# 5. Run migrations
alembic upgrade head

# 6. Load demo data (optional but recommended for a live demo)
python seed.py

# 7. Start the server
uvicorn app.main:app --reload
```

API will be live at `http://localhost:8000`, docs at `http://localhost:8000/docs`.

**Demo login (after running `seed.py`):**
```
email: haziq@example.com
password: Password123!
```

---

## 5. Running the tests

```bash
pip install -r requirements.txt
pytest tests/ -v
```

12 tests cover login, JWT auth enforcement, marking attendance, duplicate rejection,
future-date rejection, incomplete-roster rejection, updates, and deletes. Tests run
against an isolated SQLite database — they never touch your real Postgres data.

---

## 6. API reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/login` | — | Returns a JWT access token |
| POST | `/logout` | — | Stateless no-op (client discards token) |
| GET | `/profile` | ✅ | Current teacher's profile |
| GET | `/teacher/classes` | ✅ | Classes owned by the current teacher |
| GET | `/classes/{id}/students` | ✅ | Roster for a class you own |
| POST | `/attendance` | ✅ | Mark attendance for a whole class + date |
| GET | `/attendance?class_id=&date=` | ✅ | Fetch records for a class + date |
| PUT | `/attendance/{id}` | ✅ | Update one record's status/remarks |
| DELETE | `/attendance/{id}` | ✅ | Delete one record |

Send the JWT as `Authorization: Bearer <token>`.

**Response envelope** (every endpoint):
```json
{ "success": true, "message": "...", "data": { } }
{ "success": false, "message": "...", "errors": ["..."] }
```

### Example: mark attendance

```bash
curl -X POST http://localhost:8000/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "class_id": "<class-uuid>",
    "date": "2026-07-10",
    "entries": [
      {"student_id": "<student-uuid>", "status": "present"},
      {"student_id": "<student-uuid>", "status": "absent", "remarks": "Called in sick"}
    ]
  }'
```

---

## 7. Environment variables

See `.env.example`. Key ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing key — change this in any real deployment |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins |

---

## 8. Notes for the rest of Group 22

- This module only touches its own tables (`teachers`, `courses`, `classes`, `students`,
  `attendance`). If another module also needs a `Teacher`/`Student`/`Course` model, we
  should agree on one shared schema rather than duplicating tables — flag this in the
  group sync so we don't get migration conflicts.
- Auth here is self-contained (JWT issued by this module). If the group is standardizing
  on a shared auth service, `app/core/security.py` and `app/api/deps.py` are the two
  files that would need to point at it instead.
- All endpoints follow the `{success, message, data|errors}` envelope from
  `Architecture.md` §10 — worth adopting project-wide for consistency across modules.

---

## 9. Status

**Phase 1 (this delivery): Backend foundation — complete and verified.**
Tables created and tested against real PostgreSQL. All validation rules verified via live
HTTP requests, not just unit tests. 12/12 automated tests passing.

**Phase 2 (frontend) and Phase 3 (integration) are also complete** — see the root
`README.md` for the full-stack setup and the integration checks that were run against this
API together with the frontend.

**Next:** Phase 4 — screenshots/recording + submission package.
