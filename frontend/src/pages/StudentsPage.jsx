import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  ChevronRight,
  Search,
  ChevronDown,
  Download,
  UserPlus,
  Eye,
  MoreVertical,
  Users,
  BookOpen,
  BarChart3,
  Crown,
  ArrowRight,
  Upload,
  ClipboardList,
  Info,
} from "lucide-react";
import { useStudents } from "../hooks/useStudents";
import { exportStudentsCSV } from "../features/students/exportStudents";
import ClassBreakdownDonut from "../features/students/ClassBreakdownDonut";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";

const PAGE_SIZE = 10;

export default function StudentsPage() {
  const { classes, students, classBreakdown, isLoading, isError, error, totalStudents, totalClasses, avgClassSize, largestClass } =
    useStudents();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchesClass = classFilter === "all" || s.class_id === classFilter;
      const matchesSearch =
        !q || s.full_name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q);
      return matchesClass && matchesSearch;
    });
  }, [students, search, classFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  function updateSearch(v) {
    setSearch(v);
    setPage(1);
  }
  function updateClassFilter(v) {
    setClassFilter(v);
    setPage(1);
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
        <Home size={13} strokeWidth={2} />
        <Link to="/dashboard" className="hover:text-[var(--ink)]">
          Home
        </Link>
        <ChevronRight size={13} strokeWidth={2} />
        <span className="font-medium text-[var(--ink)]">Students</span>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[var(--ink)]">Students</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">View and manage all students across your classes.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportStudentsCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={15} strokeWidth={2} />
            Export List
          </button>
          <button
            disabled
            title="Adding students isn't available yet"
            className="relative flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--primary)] px-3.5 py-2.5 text-sm font-semibold text-white opacity-50"
          >
            <UserPlus size={15} strokeWidth={2} />
            Add Student
            <span className="absolute -right-2 -top-2 rounded-full bg-[var(--ink-faint)] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">
              SOON
            </span>
          </button>
        </div>
      </div>

      {isError && <ErrorBanner message={error?.message || "Couldn't load your students."} />}
      {isLoading && <Spinner label="Loading your students" />}

      {!isLoading && !isError && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Total Students" value={totalStudents} sublabel="Across all classes" tint="present" />
            <StatCard icon={BookOpen} label="Classes" value={totalClasses} sublabel="Assigned to you" tint="accent" />
            <StatCard icon={BarChart3} label="Avg Class Size" value={avgClassSize} sublabel="Students per class" tint="late" />
            <StatCard
              icon={Crown}
              label="Largest Class"
              value={largestClass ? largestClass.count : "—"}
              sublabel={largestClass ? largestClass.label : "No students yet"}
              tint="leave"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <div className="card flex flex-wrap items-center gap-3 p-3">
                <div className="relative min-w-[220px] flex-1">
                  <Search size={16} strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
                  <input
                    value={search}
                    onChange={(e) => updateSearch(e.target.value)}
                    placeholder="Search by name or roll number..."
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <select
                    value={classFilter}
                    onChange={(e) => updateClassFilter(e.target.value)}
                    className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-3.5 pr-9 text-sm font-medium text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="all">All Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} strokeWidth={2} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
                </div>
              </div>

              <div className="card overflow-hidden">
                {students.length === 0 ? (
                  <div className="px-6 py-12 text-center text-[var(--ink-soft)]">
                    No students yet. Once students are added to your classes, they'll show up here.
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="px-6 py-12 text-center text-[var(--ink-soft)]">No students match your search or filter.</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)] bg-[var(--bg)] text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Roll Number</th>
                            <th className="px-4 py-3">Student Name</th>
                            <th className="px-4 py-3">Class - Section</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-soft)]">
                          {pageRows.map((s, i) => (
                            <tr key={s.id} className="hover:bg-[var(--bg)]">
                              <td className="px-4 py-3 text-[var(--ink-faint)]">{(pageSafe - 1) * PAGE_SIZE + i + 1}</td>
                              <td className="px-4 py-3 font-mono-tab text-[var(--ink-soft)]">{s.roll_number}</td>
                              <td className="px-4 py-3 font-semibold text-[var(--ink)]">{s.full_name}</td>
                              <td className="px-4 py-3 text-[var(--ink-soft)]">{s.classLabel}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <Link
                                    to={`/attendance/${s.class_id}`}
                                    title="View class attendance"
                                    className="rounded-md p-1.5 text-[var(--ink-faint)] hover:bg-[var(--surface)] hover:text-[var(--accent)]"
                                  >
                                    <Eye size={16} strokeWidth={2} />
                                  </Link>
                                  <button
                                    disabled
                                    title="Coming soon"
                                    className="cursor-not-allowed rounded-md p-1.5 text-[var(--ink-faint)] opacity-40"
                                  >
                                    <MoreVertical size={16} strokeWidth={2} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--ink-soft)]">
                      <span>
                        Showing {(pageSafe - 1) * PAGE_SIZE + 1} to {Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
                        students
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={pageSafe === 1}
                          className="rounded-md border border-[var(--border)] px-2.5 py-1.5 font-semibold text-[var(--ink)] hover:bg-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Prev
                        </button>
                        <span className="px-2 font-medium text-[var(--ink)]">
                          Page {pageSafe} of {totalPages}
                        </span>
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={pageSafe === totalPages}
                          className="rounded-md border border-[var(--border)] px-2.5 py-1.5 font-semibold text-[var(--ink)] hover:bg-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-5">
                <h2 className="mb-4 text-base font-bold text-[var(--ink)]">Students by Class</h2>
                <ClassBreakdownDonut breakdown={classBreakdown} total={totalStudents} />
              </div>

              <div className="card p-5">
                <h2 className="mb-4 text-base font-bold text-[var(--ink)]">Quick Actions</h2>
                <div className="space-y-2">
                  <Link
                    to="/classes"
                    className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--accent-tint)]"
                  >
                    <span className="flex items-center gap-2.5">
                      <BookOpen size={16} strokeWidth={2} className="text-[var(--ink-soft)]" />
                      Manage Classes
                    </span>
                    <ArrowRight size={14} strokeWidth={2.5} className="text-[var(--ink-faint)]" />
                  </Link>
                  <Link
                    to="/reports"
                    className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--accent-tint)]"
                  >
                    <span className="flex items-center gap-2.5">
                      <ClipboardList size={16} strokeWidth={2} className="text-[var(--ink-soft)]" />
                      Attendance Reports
                    </span>
                    <ArrowRight size={14} strokeWidth={2.5} className="text-[var(--ink-faint)]" />
                  </Link>
                  <button
                    onClick={() => exportStudentsCSV(filtered)}
                    disabled={filtered.length === 0}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--accent-tint)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <Download size={16} strokeWidth={2} className="text-[var(--ink-soft)]" />
                      Export Student List
                    </span>
                    <ArrowRight size={14} strokeWidth={2.5} className="text-[var(--ink-faint)]" />
                  </button>
                  <div
                    className="relative flex cursor-default items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--ink-faint)] opacity-60"
                    aria-disabled="true"
                  >
                    <span className="flex items-center gap-2.5">
                      <Upload size={16} strokeWidth={2} />
                      Upload from Excel
                    </span>
                    <span className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--ink-faint)]">
                      SOON
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-[var(--accent-tint)] bg-[var(--accent-tint)] px-4 py-3 text-sm text-[var(--accent)]">
                <Info size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
                <p>This roster is pulled live from each of your classes. Adding, editing, or importing students isn't wired up yet.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
