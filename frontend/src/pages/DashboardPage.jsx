import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Upload,
  FileText,
  Info,
  CircleCheck,
  Circle,
} from "lucide-react";
import { useAuth } from "../store/AuthContext";
import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";
import AttendanceDonut from "../features/dashboard/AttendanceDonut";
import AttendanceTrend from "../features/attendance/AttendanceTrend";
import { todayISO, formatDisplayDate } from "../utils/date";

function firstName(fullName) {
  if (!fullName) return "";
  return fullName.split(" ")[0];
}

const QUICK_ACTIONS = [
  { label: "View All Classes", sublabel: "Manage your classes", icon: Users, to: "/classes" },
  { label: "Upload from Excel", sublabel: "Bulk attendance", icon: Upload, soon: true },
  { label: "Generate Report", sublabel: "Attendance reports & history", icon: FileText, to: "/reports" },
];

export default function DashboardPage() {
  const { teacher } = useAuth();
  const { classes, isLoading, isError, error, totalClasses, totalStudents, completedToday, pendingToday, overview, trend, trendLoading } =
    useDashboard();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[var(--ink)]">
            Welcome back{teacher?.full_name ? `, ${firstName(teacher.full_name)}` : ""}. <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Here's what's happening with your classes today.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--ink)]">
          <Calendar size={15} strokeWidth={2} className="text-[var(--ink-soft)]" />
          {formatDisplayDate(todayISO())}
        </div>
      </div>

      {isError && <ErrorBanner message={error?.message || "Couldn't load your dashboard."} />}

      {isLoading && <Spinner label="Loading your dashboard" />}

      {!isLoading && !isError && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={BookOpen} label="Classes" value={totalClasses} sublabel="Assigned to you" tint="accent" />
            <StatCard icon={Users} label="Total Students" value={totalStudents} sublabel="Across all classes" tint="present" />
            <StatCard icon={Clock} label="Attendance Pending" value={pendingToday} sublabel="Not marked today" tint="late" />
            <StatCard icon={CheckCircle2} label="Completed Today" value={completedToday} sublabel="Attendance saved" tint="leave" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <div className="card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold text-[var(--ink)]">Your Classes</h2>
                  <Link to="/classes" className="flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">
                    View all classes
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </Link>
                </div>

                {classes.length === 0 && (
                  <p className="py-8 text-center text-sm text-[var(--ink-soft)]">
                    No classes are assigned to you yet. Once a class is added, it'll show up here.
                  </p>
                )}

                {classes.length > 0 && (
                  <ul className="divide-y divide-[var(--border-soft)]">
                    {classes.map((cls) => (
                      <li key={cls.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-tint)] text-[var(--accent)]">
                            <BookOpen size={17} strokeWidth={2} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[var(--ink)]">{cls.name}</p>
                            <p className="truncate text-xs text-[var(--ink-soft)]">
                              {cls.section ? `Section ${cls.section} · ` : ""}
                              {cls.studentCount} {cls.studentCount === 1 ? "Student" : "Students"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={cls.markedToday ? "status-pill status-present" : "status-pill status-late"}>
                            {cls.markedToday ? "Completed" : "Pending"}
                          </span>
                          <Link
                            to={`/attendance/${cls.id}`}
                            className={
                              cls.markedToday
                                ? "flex items-center gap-1 whitespace-nowrap rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg)]"
                                : "flex items-center gap-1 whitespace-nowrap rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
                            }
                          >
                            {cls.markedToday ? "View Records" : "Take Attendance"}
                            <ArrowRight size={14} strokeWidth={2.5} />
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card p-5">
                <h2 className="mb-4 text-base font-bold text-[var(--ink)]">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    const content = (
                      <>
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg)] text-[var(--ink-soft)]">
                          <Icon size={17} strokeWidth={2} />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[var(--ink)]">{action.label}</span>
                          <span className="block text-xs text-[var(--ink-faint)]">{action.sublabel}</span>
                        </span>
                      </>
                    );
                    if (action.soon) {
                      return (
                        <div
                          key={action.label}
                          className="relative flex cursor-default flex-col items-start gap-2.5 rounded-lg border border-[var(--border)] p-3 opacity-60"
                          aria-disabled="true"
                        >
                          <span className="absolute right-2 top-2 rounded-full bg-[var(--bg)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--ink-faint)]">
                            SOON
                          </span>
                          {content}
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={action.label}
                        to={action.to}
                        className="flex flex-col items-start gap-2.5 rounded-lg border border-[var(--border)] p-3 transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-tint)]"
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-[var(--accent-tint)] bg-[var(--accent-tint)] px-4 py-3 text-sm text-[var(--accent)]">
                <Info size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
                <p>Tip: You can mark attendance for any class straight from the list above.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-5">
                <h2 className="mb-4 text-base font-bold text-[var(--ink)]">Attendance Overview (Today)</h2>
                <AttendanceDonut counts={overview.counts} total={overview.total} />
              </div>

              <div className="card p-5">
                <h2 className="mb-3 text-base font-bold text-[var(--ink)]">To Do List</h2>
                {classes.length === 0 && <p className="text-sm text-[var(--ink-soft)]">Nothing to do yet.</p>}
                {classes.length > 0 && (
                  <ul className="space-y-3">
                    {classes.map((cls) => (
                      <li key={cls.id}>
                        <Link
                          to={`/attendance/${cls.id}`}
                          className="flex items-center justify-between gap-2 rounded-lg px-1 py-1 hover:bg-[var(--bg)]"
                        >
                          <span className="flex items-center gap-2.5">
                            {cls.markedToday ? (
                              <CircleCheck size={18} strokeWidth={2} className="shrink-0 text-[var(--present)]" />
                            ) : (
                              <Circle size={18} strokeWidth={2} className="shrink-0 text-[var(--ink-faint)]" />
                            )}
                            <span
                              className={
                                cls.markedToday
                                  ? "text-sm text-[var(--ink-faint)] line-through"
                                  : "text-sm font-medium text-[var(--ink)]"
                              }
                            >
                              Mark attendance for {cls.name}
                            </span>
                          </span>
                          <ChevronRight size={15} strokeWidth={2} className="shrink-0 text-[var(--ink-faint)]" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card p-5">
                <h2 className="mb-2 text-base font-bold text-[var(--ink)]">Weekly Attendance Trend</h2>
                <AttendanceTrend data={trend} isLoading={trendLoading} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
