import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export default function AppLayout() {
  const { teacher, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-[var(--line)] bg-[var(--paper-raised)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/classes" className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-sm border-2 border-[var(--primary)]
                         text-[var(--primary)] font-mono-tab text-xs font-bold"
              aria-hidden="true"
            >
              R
            </span>
            <span className="font-display text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              Register
            </span>
          </Link>

          {teacher && (
            <div className="flex items-center gap-4">
              <span className="hidden text-sm text-[var(--ink-soft)] sm:inline">{teacher.full_name}</span>
              <button
                onClick={handleLogout}
                className="rounded-md border border-[var(--line)] px-3 py-1.5 text-sm font-medium
                           text-[var(--ink)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--line)] py-4 text-center text-xs text-[var(--ink-soft)]">
        Marks Entry System — Attendance Module · Group 22
      </footer>
    </div>
  );
}
