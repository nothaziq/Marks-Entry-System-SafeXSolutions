# Marks Entry System — Attendance Module (Teacher Side)

**Project:** Marks Entry System — SafeX Solutions
**Team:** Group 22
**Developer:** Muhammad Haziq (242242)
**Module:** Attendance Module (Teacher Side) — Individual Week 2 Contribution
**Stack:** React + FastAPI + PostgreSQL

This is the full-stack teacher-side attendance feature: a teacher logs in, picks one of
their classes, marks the whole roster present/absent/late/leave for a date in one bulk
save, and can come back later to edit individual records for a date already submitted.

Component-level docs live in `backend/README.md` and `frontend/README.md`. This document
covers how the two fit together, how to run the whole thing, and what's been verified.

---

## 1. Architecture

```
React (Vite)  →  REST/JSON  →  FastAPI  →  Service Layer  →  Repository Layer  →  PostgreSQL
```

Full layer breakdown is in `architecture.md`. In short: the frontend never talks to the
database — every read/write goes through the FastAPI contract, and each layer on the
backend (API → Service → Repository → DB) has exactly one job.

```
├── backend/     FastAPI + SQLAlchemy 2.0 + PostgreSQL — Phase 1
├── frontend/    React 19 + Vite + TanStack Query — Phase 2
├── architecture.md
└── README.md    (this file — Phase 3)
```

---

## 2. Running the full stack locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Postgres user/db (adjust if you already have these)
psql -U postgres -c "CREATE USER attendance_user WITH PASSWORD 'attendance_pass';"
psql -U postgres -c "CREATE DATABASE attendance_db OWNER attendance_user;"

cp .env.example .env
alembic upgrade head
python seed.py
uvicorn app.main:app --reload
```

API is now live at `http://localhost:8000` (Swagger UI at `/docs`).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env      # defaults to http://127.0.0.1:8000, matches the backend above
npm run dev
```

App is now live at `http://localhost:5173`. Log in with the seeded demo account printed
by `seed.py`:
```
email: haziq@example.com
password: Password123!
```

Docker is also available for the backend alone — see `backend/README.md` §3.

---

## 3. Integration points that were checked

The two halves were built against a shared contract (`architecture.md` §10's
`{success, message, data|errors}` envelope), but the following were specifically
re-verified together, live, against a real PostgreSQL instance rather than assumed to work:

| Check | Result |
|---|---|
| CORS preflight from `http://localhost:5173` | `Access-Control-Allow-Origin` echoes the frontend's origin; `credentials: true` |
| Login → JWT stored → `Authorization: Bearer` sent on every request | Confirmed via `api/client.js` interceptor |
| 401 on missing/expired token | Interceptor clears the stored token and redirects to `/login` |
| Bulk save (`POST /attendance`) | `201`, all rows created in one transaction |
| Duplicate submission for the same class+date | `409`, frontend switches into "edit" mode instead of re-showing the bulk-save button |
| Future-dated attendance | `422`, surfaced through `ErrorBanner` |
| Per-record edit (`PUT /attendance/{id}`) | `200`, only dirty rows are sent |
| Class the teacher doesn't own / doesn't exist | Backend returns `403`/`404` as appropriate; frontend shows the message from the `errors` array rather than a raw stack trace |

The backend's `message`/`errors` fields are what `ErrorBanner.jsx` renders directly, so
error copy written on the backend is what the teacher actually sees — no frontend-side
re-wording layer to keep in sync.

---

## 4. Loading & error states

- **Loading** — `ClassesPage` and `AttendancePage` show `Spinner` while their TanStack
  Query hooks are in flight; there's no flash of empty content before data arrives.
- **Empty states** — a class with no roster, or a teacher with no classes, gets an explicit
  message rather than a blank page.
- **Errors** — every mutation (bulk save, per-row update) catches its own failure and shows
  it inline via `ErrorBanner`, without losing the teacher's unsaved edits in the other rows.
- **Session expiry** — any `401` anywhere in the app drops the token and bounces to
  `/login`, so a stale tab can't silently fail requests forever.

---

## 5. Config cleanup done for handoff

- Added `frontend/.env.example` (`VITE_API_BASE_URL`) and made sure `.env` is gitignored
  on both sides — only `.env.example` should ever be committed.
- Removed a stray `backend/package-lock.json` that had been created by an accidental
  `npm install` inside the Python backend folder — not a real dependency of this module.
- Frontend `CORS_ORIGINS` in `backend/.env.example` already matches Vite's default port
  (`5173`), so a fresh clone works with zero edits beyond `cp .env.example .env` on both
  sides.

---

## 6. Known scope limits (for the group, not bugs)

- There's no UI or endpoint to create students/classes — those come from `seed.py` or a
  future admin/roster module. This module assumes rosters already exist.
- Auth is self-contained JWT (`backend/app/core/security.py`). If Group 22 standardizes on
  a shared auth service later, that file and `api/deps.py` are the integration point.

---

## 7. Status

| Phase | Status |
|---|---|
| 1 — Backend Foundation | ✅ Complete, tested against real PostgreSQL |
| 2 — Frontend | ✅ Complete |
| 3 — Integration & Docs | ✅ Complete — full stack verified end-to-end against real Postgres (this document) |
| 4 — Submission Package | ⏳ Not started — screenshots, recording, GitHub cleanup, explanation video |

**Next:** Phase 4 — screenshots of login/class-selector/attendance-table/validation-error,
a short screen recording of the full flow, and the explanation video.
