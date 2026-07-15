# Deploying: Vercel (frontend) + Render (backend) + Neon (database)

This is the free-tier deployment path for this project: static frontend on
Vercel, Dockerized backend on Render, managed Postgres on Neon, with a
GitHub Actions workflow standing in for Render's (paid-only) free cron
jobs to reliably fire the daily attendance reminder.

Total cost: $0. No credit card required on any of the three platforms as
of this writing (worth re-checking on each platform's own pricing page,
since free-tier terms change).

---

## Why this split, briefly

Vercel is serverless-only - it can't run a persistent process, which is
what this backend needs (APScheduler's background thread, and just a
normal long-lived FastAPI/uvicorn process in general). So the frontend
(static files) goes to Vercel, and the backend (Docker container) goes to
a platform built for persistent processes - Render.

## The one real catch, and how this repo already handles it

Render's **free** web services spin down after 15 minutes of no incoming
requests, and free Cron Jobs aren't available on Render's free tier. That
means:
- If the backend happens to be asleep at `REMINDER_HOUR`, APScheduler's
  in-process timer isn't running, so it can't fire.
- APScheduler's code itself is complete and correct (see the tests in
  `backend/tests/test_reminder_service.py`) - this is purely a hosting
  constraint, not a bug.

The fix already in this repo: `.github/workflows/daily-reminder.yml` runs
on its own independent schedule (GitHub's infrastructure, not Render's),
logs in, and calls your existing `POST /v1/admin/trigger-reminders`
endpoint. Logging in also happens to wake a sleeping instance. APScheduler
stays in place as a harmless backup - it'll still fire correctly on any
day the server happens to already be awake at that time.

---

## Step 1 - Neon (database)

1. Sign up at [neon.tech](https://neon.tech), create a project.
2. On the project dashboard, click **Connect** and copy the connection
   string. Use the **direct** connection (not the one with `-pooler` in
   the hostname) - direct connections are what Neon recommends for
   Alembic migrations, and this app is small enough not to need
   PgBouncer's extra concurrency.
3. It should look like:
   ```
   postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require&channel_binding=require
   ```
   That's your `DATABASE_URL` - no code changes needed, `psycopg2` reads
   `sslmode`/`channel_binding` straight out of the URL.
4. Neon's free tier never expires (unlike Render's own free Postgres,
   which is hard-deleted 30 days after creation - this is why Neon is
   used here instead of Render's bundled database).

## Step 2 - Render (backend)

**Easiest path: Blueprint.** This repo includes `render.yaml` at the root.
1. In the Render dashboard: **New -> Blueprint**, select this repo.
2. Render reads `render.yaml` and proposes one web service. It'll prompt
   you for the values marked `sync: false` - paste in:
   - `DATABASE_URL` - the Neon connection string from Step 1
   - `SECRET_KEY` - generate with
     `python -c "import secrets; print(secrets.token_hex(32))"`
   - `CORS_ORIGINS` - your Vercel URL (you won't have this yet on first
     deploy - use a placeholder like `https://placeholder.vercel.app` and
     come back to update it after Step 3)
   - `GMAIL_ADDRESS` / `GMAIL_APP_PASSWORD` - optional, leave blank to
     disable reminder emails. See "Gmail App Password" below.
3. Deploy. Render builds `backend/Dockerfile`, runs
   `alembic upgrade head` then `uvicorn` on container start (already
   wired into the Dockerfile's `CMD`), and gives you a URL like
   `https://marks-entry-attendance-api.onrender.com`.
4. Seed demo data once, from the Render dashboard's **Shell** tab on your
   service:
   ```
   python seed.py
   ```

**Timezone note:** `REMINDER_HOUR`/`REMINDER_MINUTE` are interpreted in
the container's local time, and Render's containers run in **UTC**, not
Pakistan time. If you want the check to run at, say, 8 PM PKT (UTC+5),
set `REMINDER_HOUR=15`. Keep this in sync with the cron line in
`.github/workflows/daily-reminder.yml` (also UTC).

## Step 3 - Vercel (frontend)

1. Import this repo into Vercel.
2. In the project's **Settings -> General -> Root Directory**, set it to
   `frontend` (this is a monorepo - Vercel needs to know the frontend
   lives in a subfolder). Framework preset should auto-detect as Vite.
3. In **Settings -> Environment Variables**, add:
   ```
   VITE_API_BASE_URL = https://marks-entry-attendance-api.onrender.com
   ```
   (your actual Render URL from Step 2 - no trailing slash). Vite bakes
   this into the build at build time, so redeploy after setting it.
4. Deploy. `frontend/vercel.json` (already in the repo) handles the SPA
   rewrite so client-side routes like `/attendance/:classId` don't 404 on
   refresh. If you still see 404s on refresh after deploying, double-check
   Root Directory is actually set to `frontend` - `vercel.json` only gets
   picked up from inside whatever directory Vercel treats as the project
   root, which is a common gotcha in monorepos like this one.
5. Go back to Render and update `CORS_ORIGINS` to your real Vercel URL
   from this step, then redeploy the backend so it actually accepts
   requests from it.

## Step 4 - GitHub Actions (reliable daily trigger)

1. In this repo: **Settings -> Secrets and variables -> Actions -> New
   repository secret**. Add three:
   - `API_BASE_URL` - your Render URL, e.g.
     `https://marks-entry-attendance-api.onrender.com`
   - `ADMIN_EMAIL` - an `is_admin=true` teacher's email (the seeded demo
     teacher already has this)
   - `ADMIN_PASSWORD` - that teacher's password
2. That's it - `.github/workflows/daily-reminder.yml` is already in the
   repo and will pick these up automatically on its next scheduled run.
3. **To test without waiting for the schedule:** go to the repo's
   **Actions** tab -> "Daily Attendance Reminder" -> **Run workflow**.
   Watch the log; it prints the login result and the trigger response.

**Security tradeoff, worth knowing:** this stores a real teacher password
as a GitHub secret. That's acceptable for a coursework project, but if
this were ever a real production system, a better pattern would be a
dedicated shared-secret header (e.g. `X-Cron-Secret`) checked against an
env var on a purpose-built endpoint, instead of reusing full login
credentials for an automated job. Not built here since it's beyond this
project's scope, but worth knowing if this ever needs hardening.

## Gmail App Password (optional, for real reminder emails)

Google Account -> Security -> **2-Step Verification** (must be turned on
first) -> **App Passwords** -> generate one named e.g. "Marks Entry
System". That 16-character value is `GMAIL_APP_PASSWORD` - not your real
Gmail password. Set both `GMAIL_ADDRESS` and `GMAIL_APP_PASSWORD` on
Render (Step 2). Leaving them blank doesn't break anything - the app logs
the failure and moves on, per `backend/app/services/email_service.py`.

---

## Verifying it's all actually working

1. Visit your Vercel URL, log in with the seeded demo account.
2. Mark attendance for a class, confirm it saves (proves frontend -> Render -> Neon).
3. From the repo's Actions tab, manually run "Daily Attendance Reminder"
   and check the log shows `"success":true`.
4. If you set Gmail credentials, check the inbox for the reminder email.
