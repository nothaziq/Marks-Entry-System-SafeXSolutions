import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  ChevronRight,
  ChevronDown,
  Calendar,
  Filter,
  Check,
  X,
  Trophy,
  Eye,
  Info,
  Download,
  FileText,
  FileSpreadsheet,
  BookOpen,
  Users,
  BarChart3,
} from "lucide-react";
import { useReports } from "../hooks/useReports";
import { bucketTrend } from "../features/reports/bucketTrend";
import AttendanceAreaChart from "../features/reports/AttendanceAreaChart";
import AttendanceDonut from "../features/dashboard/AttendanceDonut";
import { exportReportCSV, exportReportExcel, exportReportPDF } from "../features/reports/exportUtils";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";
import { todayISO, addDaysISO, formatShortDate } from "../utils/date";

const GENERATED_KEY = "reports_generated_count";

function useReportsGeneratedCount() {
  const [count, setCount] = useState(() => Number(localStorage.getItem(GENERATED_KEY) || 0));
  const increment = () => {
    setCount((c) => {
      const next = c + 1;
      localStorage.setItem(GENERATED_KEY, String(next));
      return next;
    });
  };
  return [count, increment];
}

export default function ReportsPage() {
  const [from, setFrom] = useState(() => addDaysISO(todayISO(), -29));
  const [to, setTo] = useState(() => todayISO());
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [granularity, setGranularity] = useState("daily");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [generatedCount, incrementGenerated] = useReportsGeneratedCount();

  const { allClasses, perClass, totals, totalStudents, dailyTrend, topClasses, isLoading, isError, error } = useReports({
    from,
    to,
    classIds: selectedClassIds,
  });

  const trendPoints = useMemo(() => bucketTrend(dailyTrend, granularity), [dailyTrend, granularity]);

  function toggleClass(id) {
    setSelectedClassIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleExport(format) {
    if (perClass.length === 0) return;
    if (format === "csv") exportReportCSV(perClass, { from, to });
    if (format === "excel") await exportReportExcel(perClass, { from, to });
    if (format === "pdf") exportReportPDF();
    incrementGenerated();
  }

  return (
    <div id="print-report">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="no-print mb-2 flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
            <Home size={13} strokeWidth={2} />
            <Link to="/dashboard" className="hover:text-[var(--ink)]">
              Home
            </Link>
            <ChevronRight size={12} strokeWidth={2} />
            <span className="font-medium text-[var(--ink)]">Reports</span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[var(--ink)]">Attendance Reports</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Generate and download attendance reports with detailed analytics.</p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <button
              onClick={() => {
                setShowDatePicker((v) => !v);
                setShowFilters(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--ink)]"
            >
              <Calendar size={15} strokeWidth={2} className="text-[var(--ink-soft)]" />
              {formatShortDate(from)} - {formatShortDate(to)}
              <ChevronDown size={14} strokeWidth={2} className="text-[var(--ink-soft)]" />
            </button>
            {showDatePicker && (
              <div className="card absolute right-0 top-full z-10 mt-2 w-72 p-4">
                <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">From</label>
                <input
                  type="date"
                  value={from}
                  max={to}
                  onChange={(e) => setFrom(e.target.value)}
                  className="mb-3 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                />
                <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">To</label>
                <input
                  type="date"
                  value={to}
                  min={from}
                  max={todayISO()}
                  onChange={(e) => setTo(e.target.value)}
                  className="mb-3 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                />
                <p className="mb-2 text-xs text-[var(--ink-faint)]">
                  Fetches attendance per class per day — wider ranges take a little longer to load.
                </p>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="w-full rounded-lg bg-[var(--primary)] py-2 text-sm font-semibold text-white"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowFilters((v) => !v);
                setShowDatePicker(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--ink)]"
            >
              <Filter size={15} strokeWidth={2} className="text-[var(--ink-soft)]" />
              Filters
              {selectedClassIds.length > 0 && (
                <span className="rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {selectedClassIds.length}
                </span>
              )}
              <ChevronDown size={14} strokeWidth={2} className="text-[var(--ink-soft)]" />
            </button>
            {showFilters && (
              <div className="card absolute right-0 top-full z-10 mt-2 w-72 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold text-[var(--ink-soft)]">Classes</p>
                  {selectedClassIds.length > 0 && (
                    <button
                      onClick={() => setSelectedClassIds([])}
                      className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)]"
                    >
                      <X size={12} strokeWidth={2.5} />
                      Clear
                    </button>
                  )}
                </div>
                <ul className="max-h-56 space-y-1 overflow-y-auto">
                  {allClasses.map((c) => {
                    const checked = selectedClassIds.includes(c.id);
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => toggleClass(c.id)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-[var(--bg)]"
                        >
                          <span
                            className={
                              checked
                                ? "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--accent)] bg-[var(--accent)] text-white"
                                : "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--border)]"
                            }
                          >
                            {checked && <Check size={11} strokeWidth={3} />}
                          </span>
                          <span className="min-w-0 truncate text-[var(--ink)]">
                            {c.name}
                            {c.section ? ` — Section ${c.section}` : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 text-xs text-[var(--ink-faint)]">Leave everything unchecked to include all classes.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isError && <ErrorBanner message={error?.message || "Couldn't load report data."} />}
      {isLoading && <Spinner label="Building your report" />}

      {!isLoading && !isError && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={BookOpen} label="Total Classes" value={perClass.length} sublabel="In this report" tint="accent" />
            <StatCard icon={Users} label="Total Students" value={totalStudents} sublabel="Across selected classes" tint="present" />
            <StatCard
              icon={BarChart3}
              label="Average Attendance"
              value={totals.rate === null ? "—" : `${totals.rate}%`}
              sublabel="Overall average"
              tint="leave"
            />
            <StatCard icon={FileText} label="Reports Generated" value={generatedCount} sublabel="In this browser" tint="late" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <div className="card p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-base font-bold text-[var(--ink)]">Attendance Trend</h2>
                  <select
                    value={granularity}
                    onChange={(e) => setGranularity(e.target.value)}
                    className="no-print rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <AttendanceAreaChart points={trendPoints} isLoading={false} />
              </div>

              <div className="card p-5">
                <h2 className="mb-4 text-base font-bold text-[var(--ink)]">Class-wise Attendance Summary</h2>
                {perClass.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[var(--ink-soft)]">No classes match the current filters.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-xs font-semibold text-[var(--ink-soft)]">
                          <th className="py-2 pr-3">#</th>
                          <th className="py-2 pr-3">Course</th>
                          <th className="py-2 pr-3">Section</th>
                          <th className="py-2 pr-3">Students</th>
                          <th className="py-2 pr-3">Avg Attendance</th>
                          <th className="py-2 pr-3">Present</th>
                          <th className="py-2 pr-3">Absent</th>
                          <th className="py-2 pr-3">Late</th>
                          <th className="py-2 pr-3">Leave</th>
                          <th className="no-print py-2 pr-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-soft)]">
                        {perClass.map((c, i) => (
                          <tr key={c.id}>
                            <td className="py-2.5 pr-3 text-[var(--ink-soft)]">{i + 1}</td>
                            <td className="py-2.5 pr-3 font-semibold text-[var(--ink)]">{c.name}</td>
                            <td className="py-2.5 pr-3 text-[var(--ink-soft)]">{c.section || "—"}</td>
                            <td className="py-2.5 pr-3 text-[var(--ink-soft)]">{c.studentCount}</td>
                            <td className="py-2.5 pr-3 font-semibold text-[var(--ink)]">{c.rate === null ? "—" : `${c.rate}%`}</td>
                            <td className="py-2.5 pr-3 text-[var(--present)]">{c.counts.present}</td>
                            <td className="py-2.5 pr-3 text-[var(--absent)]">{c.counts.absent}</td>
                            <td className="py-2.5 pr-3 text-[var(--late)]">{c.counts.late}</td>
                            <td className="py-2.5 pr-3 text-[var(--leave)]">{c.counts.leave}</td>
                            <td className="no-print py-2.5 pr-3">
                              <Link
                                to={`/attendance/${c.id}`}
                                title="View class register"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-soft)] hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                              >
                                <Eye size={15} strokeWidth={2} />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="no-print flex items-start gap-2.5 rounded-lg border border-[var(--accent-tint)] bg-[var(--accent-tint)] px-4 py-3 text-sm text-[var(--accent)]">
                <Info size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
                <p>Click the eye icon to open that class's attendance register for the selected range.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-5">
                <h2 className="mb-4 text-base font-bold text-[var(--ink)]">Attendance Distribution</h2>
                <AttendanceDonut counts={totals.counts} total={totals.total} />
              </div>

              <div className="card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Trophy size={16} strokeWidth={2} className="text-[var(--present)]" />
                  <h2 className="text-base font-bold text-[var(--ink)]">Top Performing Classes</h2>
                </div>
                {topClasses.length === 0 ? (
                  <p className="text-sm text-[var(--ink-soft)]">No attendance recorded in this range yet.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {topClasses.map((c, i) => (
                      <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] text-xs font-bold text-[var(--ink-soft)]">
                            {i + 1}
                          </span>
                          <span className="truncate font-medium text-[var(--ink)]">
                            {c.name}
                            {c.section ? ` - Section ${c.section}` : ""}
                          </span>
                        </span>
                        <span className="shrink-0 font-bold text-[var(--present)]">{c.rate}%</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to="/classes"
                  className="mt-4 flex items-center justify-center gap-1 rounded-lg border border-[var(--border)] py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg)]"
                >
                  View all classes
                  <ChevronRight size={14} strokeWidth={2.5} />
                </Link>
              </div>

              <div className="no-print card p-5">
                <div className="mb-1 flex items-center gap-2">
                  <Download size={16} strokeWidth={2} className="text-[var(--ink)]" />
                  <h2 className="text-base font-bold text-[var(--ink)]">Export Reports</h2>
                </div>
                <p className="mb-3 text-xs text-[var(--ink-soft)]">Download attendance data in your preferred format.</p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleExport("pdf")}
                    disabled={perClass.length === 0}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-[var(--absent-border)] bg-[var(--absent-tint)] px-3.5 py-2.5 text-sm font-semibold text-[var(--absent)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileText size={16} strokeWidth={2} />
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport("excel")}
                    disabled={perClass.length === 0}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-[var(--present-border)] bg-[var(--present-tint)] px-3.5 py-2.5 text-sm font-semibold text-[var(--present)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileSpreadsheet size={16} strokeWidth={2} />
                    Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    disabled={perClass.length === 0}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileText size={16} strokeWidth={2} />
                    Export as CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
