# Attendance Module (Teacher Side) — Frontend

**Project:** Marks Entry System — SafeX Solutions
**Team:** Group 22
**Developer:** Muhammad Haziq (242242)
**Module:** Attendance Module (Teacher Side) — Individual Week 2 Contribution

React + Vite frontend for the teacher-side attendance feature. A teacher logs in, picks a
class, marks the whole roster present/absent/late/leave for a date in one bulk save, and can
come back later to edit individual records for a date that's already been submitted.

Built against the Phase 1 FastAPI backend in `../backend`.

---

## 1. Project structure

```
frontend/
├── src/
│   ├── api/client.js            # axios instance — attaches JWT, normalizes errors, 401 -> logout
│   ├── services/                # one function per backend endpoint (auth/class/attendance)
│   ├── hooks/                   # TanStack Query hooks wrapping the services
│   ├── store/AuthContext.jsx    # auth state (token, profile, login/logout) via React Context
│   ├── routes/ProtectedRoute.jsx
│   ├── layouts/AppLayout.jsx    # header + logout, wraps authenticated pages
│   ├── pages/                   # LoginPage, ClassesPage, AttendancePage
│   ├── features/attendance/     # AttendanceRegister (bulk save / edit logic), AttendanceRow
│   ├── components/              # StatusSelect, StatusStamp, Spinner, ErrorBanner
│   ├── utils/                   # date helpers, status constants (mirrors backend enum)
│   ├── App.jsx                  # route table
│   └── main.jsx                 # entrypoint — QueryClientProvider + AuthProvider
├── index.html
├── vite.config.js
└── .env.example
```

Each backend endpoint has exactly one service function that calls it, and every page/feature
component goes through a hook — no component calls axios directly. This keeps the same
"one job per layer" separation the backend uses.

---

## 2. Running it

**Prerequisites:** Node 18+, and the backend running locally at `http://localhost:8000`
(see `../backend/README.md`).

```bash
cd frontend
npm install
cp .env.example .env      # defaults already point at the local backend
npm run dev
```

Open `http://localhost:5173`. Log in with the seeded demo account from the backend
(`haziq@example.com` / `Password123!` after running `python seed.py`).

Other scripts:
```bash
npm run build     # production build -> dist/
npm run preview   # serve the production build locally
npm run lint       # oxlint
```

---

## 3. How the pieces fit together

- **Auth** — `AuthContext` holds the JWT (persisted in `localStorage`) and the current
  teacher's profile. `ProtectedRoute` redirects to `/login` if there's no valid session, and
  the axios interceptor in `api/client.js` force-logs-out on any `401` response so an expired
  token never gets stuck retrying.
- **Classes** — `ClassesPage` lists the teacher's classes (`GET /teacher/classes`) as cards
  linking to `/attendance/:classId`.
- **Attendance register** — `AttendancePage` loads the roster and any existing records for
  the selected date in parallel. `AttendanceRegister` then works in one of two modes:
  - **Draft** (no records yet for this class + date): every student needs a status before
    the bulk **Save attendance** button (`POST /attendance`) is enabled — mirrors the
    backend's "every student must have a status" rule.
  - **Saved** (records already exist): changing a status/remark marks that row dirty, and
    **Save N change(s)** sends one `PUT /attendance/{id}` per dirty row.
- **Server state** — all reads/writes go through TanStack Query (`hooks/useClasses.js`,
  `hooks/useAttendance.js`), so caching, loading states, and refetch-after-save are handled
  without manual `useEffect` plumbing.

---

## 4. Environment variables

See `.env.example`.

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend. Defaults to `http://127.0.0.1:8000`. |

---

## 5. Status

**Phase 2 (this delivery): Frontend — complete.**
Login, class selector, date-scoped attendance register with bulk save and per-row edit, and
route protection are all wired to the live Phase 1 API contract.

**Phase 3 (integration) is also complete** — see the root `README.md` for the full-stack
setup and the specific CORS/auth/error/loading checks that were run against a live backend.

**Next:** Phase 4 — screenshots/recording + submission package.
