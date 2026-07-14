import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutGrid,
  BookOpen,
  History,
  BarChart3,
  Users,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../store/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid, to: "/dashboard" },
  { label: "Classes", icon: BookOpen, to: "/classes" },
  { label: "Attendance History", icon: History, to: null },
  { label: "Reports", icon: BarChart3, to: "/reports" },
  { label: "Students", icon: Users, to: "/students" },
  { label: "Profile", icon: UserCircle, to: null },
  { label: "Settings", icon: Settings, to: null, soon: true },
];

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export default function AppLayout() {
  const { teacher, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-full" style={{ background: "var(--bg)" }}>
      <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <GraduationCap size={19} strokeWidth={2.25} />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-bold text-[var(--ink)]">Marks Entry</span>
            <span className="block text-xs text-[var(--ink-soft)]">SafeX Solutions</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.matchPrefix
                ? location.pathname.startsWith(item.matchPrefix)
                : Boolean(item.to) && location.pathname === item.to;
            const commonClasses =
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";

            if (!item.to) {
              return (
                <div
                  key={item.label}
                  className={`${commonClasses} cursor-default justify-between text-[var(--ink-faint)]`}
                  aria-disabled="true"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} strokeWidth={2} />
                    {item.label}
                  </span>
                  {item.soon && (
                    <span className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--ink-faint)]">
                      SOON
                    </span>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.to}
                className={
                  isActive
                    ? `${commonClasses} bg-[var(--primary)] text-white`
                    : `${commonClasses} text-[var(--ink-soft)] hover:bg-[var(--bg)] hover:text-[var(--ink)]`
                }
              >
                <Icon size={18} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {teacher && (
          <div className="space-y-3 border-t border-[var(--border)] p-3">
            <div className="flex items-center gap-2.5 rounded-lg bg-[var(--bg)] p-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
                {initials(teacher.full_name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--ink)]">{teacher.full_name}</p>
                <p className="truncate text-xs text-[var(--ink-soft)]">{teacher.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="shrink-0 rounded-md p-1.5 text-[var(--ink-faint)] hover:bg-white hover:text-[var(--absent)]"
              >
                <LogOut size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-xs text-[var(--ink-soft)]">
              <span className="font-semibold text-[var(--ink)]">Group 22</span>
              <br />
              Week 2 · Attendance Module
            </div>
          </div>
        )}
      </aside>

      <div className="flex min-h-full flex-1 flex-col">
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
