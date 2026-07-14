import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  DoorOpen,
  Search,
  ClipboardCheck,
  RotateCcw,
  Save,
  Check,
  Calendar,
  TrendingUp,
  Zap,
  FolderOpen,
  Download,
} from "lucide-react";
import AttendanceRow from "./AttendanceRow";
import AttendanceTrend from "./AttendanceTrend";
import StatCard from "../../components/StatCard";
import ErrorBanner from "../../components/ErrorBanner";
import { useAttendanceTrend } from "../../hooks/useAttendance";
import { STATUS_LABEL } from "../../utils/constants";

function buildRows(roster, records) {
  const byStudent = new Map(records.map((r) => [r.student_id, r]));
  return roster
    .map((s) => {
      const existing = byStudent.get(s.id);
      return {
        studentId: s.id,
        fullName: s.full_name,
        rollNumber: s.roll_number,
        attendanceId: existing?.id || null,
        status: existing?.status || "",
        remarks: existing?.remarks || "",
        savedStatus: existing?.status || "",
        savedRemarks: existing?.remarks || "",
      };
    })
    .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true }));
}

function downloadCSV(rows, className, date) {
  const header = ["Roll Number", "Student Name", "Status", "Remarks"];
  const lines = rows.map((r) => [r.rollNumber, r.fullName, STATUS_LABEL[r.status] || "", r.remarks || ""]);
  const csv = [header, ...lines]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance-${className || "class"}-${date}.csv`.replace(/\s+/g, "-").toLowerCase();
  a.click();
  URL.revokeObjectURL(url);
}

export default function AttendanceRegister({
  classId,
  className,
  date,
  roster,
  records,
  onSubmitAll,
  onUpdateOne,
  isSubmitting,
  isUpdating,
}) {
  const [rows, setRows] = useState(() => buildRows(roster, records));
  const [formError, setFormError] = useState(null);
  const [search, setSearch] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 1600);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const trendQuery = useAttendanceTrend(classId);

  const mode = records.length > 0 ? "saved" : "draft";
  const dirtyRows = rows.filter((r) => r.status !== r.savedStatus || r.remarks !== r.savedRemarks);
  const allStatusesSet = rows.every((r) => !!r.status);

  const counts = useMemo(() => {
    const c = { total: rows.length, present: 0, absent: 0, late: 0, leave: 0 };
    rows.forEach((r) => {
      if (r.status && c[r.status] !== undefined) c[r.status] += 1;
    });
    return c;
  }, [rows]);

  const marked = counts.present + counts.absent + counts.late + counts.leave;
  const attendanceRate = marked > 0 ? Math.round(((counts.present + counts.late) / marked) * 100) : null;
  const pct = (n) => (counts.total > 0 ? Math.round((n / counts.total) * 100) : 0);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.fullName.toLowerCase().includes(q) || r.rollNumber.toLowerCase().includes(q));
  }, [rows, search]);

  function updateRow(updated) {
    setRows((prev) => prev.map((r) => (r.studentId === updated.studentId ? updated : r)));
  }

  function markAllPresent() {
    setRows((prev) => prev.map((r) => ({ ...r, status: "present" })));
  }

  function resetRows() {
    setRows((prev) => prev.map((r) => ({ ...r, status: r.savedStatus, remarks: r.savedRemarks })));
    setFormError(null);
  }

  async function handleBulkSave() {
    setFormError(null);
    if (!allStatusesSet) {
      setFormError("Every student on the roster needs a status before you can save.");
      return;
    }
    try {
      await onSubmitAll(rows.map((r) => ({ student_id: r.studentId, status: r.status, remarks: r.remarks || null })));
      setRows((prev) => prev.map((r) => ({ ...r, savedStatus: r.status, savedRemarks: r.remarks })));
      setLastSavedAt(new Date());
      setJustSaved(true);
    } catch (err) {
      setFormError(err.message || "Couldn't save attendance.");
    }
  }

  async function handleSaveChanges() {
    setFormError(null);
    try {
      await Promise.all(
        dirtyRows.filter((r) => r.attendanceId).map((r) => onUpdateOne(r.attendanceId, { status: r.status, remarks: r.remarks || null }))
      );
      setRows((prev) => prev.map((r) => ({ ...r, savedStatus: r.status, savedRemarks: r.remarks })));
      setLastSavedAt(new Date());
      setJustSaved(true);
    } catch (err) {
      setFormError(err.message || "Couldn't save your changes.");
    }
  }

  const isSaving = isSubmitting || isUpdating;

  if (roster.length === 0) {
    return (
      <div className="card px-6 py-12 text-center text-[var(--ink-soft)]">This class has no students on its roster yet.</div>
    );
  }

  return (
    <div>
      {formError && (
        <div className="mb-4">
          <ErrorBanner message={formError} />
        </div>
      )}

      <div className="mb-6 grid animate-fade-up grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Users} label="Total Students" value={counts.total} sublabel="Enrolled" tint="accent" />
        <StatCard icon={CheckCircle2} label="Present" value={counts.present} sublabel={`${pct(counts.present)}%`} tint="present" />
        <StatCard icon={XCircle} label="Absent" value={counts.absent} sublabel={`${pct(counts.absent)}%`} tint="absent" />
        <StatCard icon={Clock} label="Late" value={counts.late} sublabel={`${pct(counts.late)}%`} tint="late" />
        <StatCard icon={DoorOpen} label="Leave" value={counts.leave} sublabel={`${pct(counts.leave)}%`} tint="leave" />
      </div>

      <div className="grid animate-fade-up grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={16} strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student by name or roll number…"
                className="w-full rounded-lg border border-[var(--border)] py-2 pl-9 pr-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)]"
              />
            </div>
            <button
              onClick={markAllPresent}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition-all duration-150 hover:bg-[var(--bg)] active:scale-[0.97]"
            >
              <ClipboardCheck size={16} strokeWidth={2} />
              Mark All Present
            </button>
            <button
              onClick={resetRows}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition-all duration-150 hover:bg-[var(--bg)] active:scale-[0.97]"
            >
              <RotateCcw size={16} strokeWidth={2} />
              Reset
            </button>
            <button
              onClick={mode === "draft" ? handleBulkSave : handleSaveChanges}
              disabled={isSaving || (mode === "draft" ? !allStatusesSet : dirtyRows.length === 0)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 ${
                justSaved ? "bg-[var(--present)]" : "bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
              }`}
            >
              {justSaved ? (
                <Check key="saved-icon" size={16} strokeWidth={2.5} className="animate-pop-in" />
              ) : (
                <Save size={16} strokeWidth={2} />
              )}
              {justSaved
                ? "Saved"
                : isSaving
                  ? "Saving…"
                  : mode === "draft"
                    ? "Save Attendance"
                    : dirtyRows.length > 0
                      ? `Save ${dirtyRows.length} Change${dirtyRows.length > 1 ? "s" : ""}`
                      : "Save Attendance"}
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="hidden grid-cols-[2rem_6rem_1fr_9rem_1fr] gap-3 border-b border-[var(--border)] bg-[var(--bg)] px-5 py-2.5 text-xs font-semibold text-[var(--ink-soft)] sm:grid">
              <span>#</span>
              <span>Roll Number</span>
              <span>Student Name</span>
              <span>Status</span>
              <span>Remarks</span>
            </div>
            {filteredRows.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-[var(--ink-soft)]">No students match "{search}".</p>
            ) : (
              filteredRows.map((row) => {
                const index = rows.findIndex((r) => r.studentId === row.studentId) + 1;
                return <AttendanceRow key={row.studentId} index={index} row={row} onChange={updateRow} />;
              })
            )}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-[var(--accent-tint)] px-4 py-3 text-sm text-[var(--ink-soft)]">
            <Calendar size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <span>
              {mode === "draft"
                ? "Don't forget to save your attendance. You can come back and edit it any time before someone else submits."
                : "Attendance for this date is already recorded. Change a status or remark above and save to update it."}
            </span>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Calendar size={16} strokeWidth={2} className="text-[var(--ink-soft)]" />
              <h2 className="text-sm font-bold text-[var(--ink)]">Today's Summary</h2>
            </div>
            <ul className="space-y-2.5 text-sm">
              <SummaryRow color="present" label="Present" value={counts.present} />
              <SummaryRow color="absent" label="Absent" value={counts.absent} />
              <SummaryRow color="late" label="Late" value={counts.late} />
              <SummaryRow color="leave" label="Leave" value={counts.leave} />
            </ul>

            <div className="mt-4 border-t border-[var(--border-soft)] pt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-[var(--ink-soft)]">Attendance Rate</span>
                <span className="text-lg font-extrabold text-[var(--ink)]">{attendanceRate ?? "—"}{attendanceRate !== null && "%"}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg)]">
                <div
                  className="h-full rounded-full bg-[var(--present)] transition-[width] duration-500 ease-out"
                  style={{ width: `${attendanceRate ?? 0}%` }}
                />
              </div>
            </div>

            {lastSavedAt && (
              <div className="mt-3 flex items-center justify-between border-t border-[var(--border-soft)] pt-3 text-xs text-[var(--ink-soft)]">
                <span>Last Saved</span>
                <span className="font-medium text-[var(--ink)]">
                  {lastSavedAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            )}
          </div>

          <div className="card p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp size={16} strokeWidth={2} className="text-[var(--ink-soft)]" />
              <h2 className="text-sm font-bold text-[var(--ink)]">Attendance Trend</h2>
            </div>
            <AttendanceTrend data={trendQuery.data} isLoading={trendQuery.isLoading} />
          </div>

          <div className="card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Zap size={16} strokeWidth={2} className="text-[var(--ink-soft)]" />
              <h2 className="text-sm font-bold text-[var(--ink)]">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              <Link
                to="/classes"
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition-all duration-150 hover:bg-[var(--bg)] active:scale-[0.97]"
              >
                <FolderOpen size={16} strokeWidth={2} />
                View All Classes
              </Link>
              <button
                onClick={() => downloadCSV(rows, className, date)}
                className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition-all duration-150 hover:bg-[var(--bg)] active:scale-[0.97]"
              >
                <Download size={16} strokeWidth={2} />
                Export CSV
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({ color, label, value }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-[var(--ink-soft)]">
        <span className="h-2 w-2 rounded-full" style={{ background: `var(--${color})` }} />
        {label}
      </span>
      <span className="font-semibold text-[var(--ink)]">{value}</span>
    </li>
  );
}
