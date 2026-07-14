import { useMemo, useRef, useState } from "react";
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useClasses, useClassRoster } from "../../hooks/useClasses";
import { useAttendance, useAttendanceMutations } from "../../hooks/useAttendance";
import { parseAttendanceFile, normalizeStatus, downloadAttendanceTemplate } from "./attendanceImport";
import ErrorBanner from "../../components/ErrorBanner";
import Spinner from "../../components/Spinner";
import { todayISO } from "../../utils/date";
import { STATUS_LABEL } from "../../utils/constants";

const EMPTY_ARRAY = [];

export default function ImportAttendanceModal({ onClose, defaultClassId }) {
  const fileInputRef = useRef(null);

  const { data: classes } = useClasses();
  const [classId, setClassId] = useState(defaultClassId || "");
  const [date, setDate] = useState(todayISO());
  const [fileName, setFileName] = useState(null);
  const [parsedRows, setParsedRows] = useState(null);
  const [fillMissingAsAbsent, setFillMissingAsAbsent] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [successCount, setSuccessCount] = useState(null);

  const effectiveClassId = classId || classes?.[0]?.id || "";

  const rosterQuery = useClassRoster(effectiveClassId);
  const attendanceQuery = useAttendance(effectiveClassId, date);
  const { markMutation, updateMutation } = useAttendanceMutations(effectiveClassId, date);

  const roster = rosterQuery.data || EMPTY_ARRAY;
  const existingRecords = attendanceQuery.data?.records || EMPTY_ARRAY;
  const mode = existingRecords.length > 0 ? "update" : "create";
  const selectedClass = classes?.find((c) => c.id === effectiveClassId);

  const matched = useMemo(() => {
    if (!parsedRows) return null;
    const rosterByRoll = new Map(roster.map((s) => [s.roll_number.trim().toLowerCase(), s]));
    const existingByStudent = new Map(existingRecords.map((r) => [r.student_id, r]));

    const results = parsedRows.map((row) => {
      const student = rosterByRoll.get(row.rollNumber.toLowerCase());
      const status = normalizeStatus(row.statusRaw);

      if (!student) return { ...row, kind: "unmatched" };
      if (!status) return { ...row, kind: "invalid-status", student };

      const existing = existingByStudent.get(student.id);
      if (mode === "update" && !existing) return { ...row, kind: "no-existing-record", student, status };

      return { ...row, kind: "ready", student, status, attendanceId: existing?.id || null };
    });

    const readyStudentIds = new Set(results.filter((r) => r.kind === "ready").map((r) => r.student.id));
    const missingStudents = mode === "create" ? roster.filter((s) => !readyStudentIds.has(s.id)) : [];

    return { results, missingStudents };
  }, [parsedRows, roster, existingRecords, mode]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setSubmitError(null);
    setSuccessCount(null);
    setFileName(file.name);
    try {
      const rows = await parseAttendanceFile(file);
      if (rows.length === 0) {
        setParseError("Couldn't find any rows with a Roll Number or Status column in that file.");
        setParsedRows(null);
        return;
      }
      setParsedRows(rows);
    } catch {
      setParseError("Couldn't read that file. Make sure it's a .xlsx, .xls, or .csv file.");
      setParsedRows(null);
    }
  }

  function reset() {
    setFileName(null);
    setParsedRows(null);
    setSuccessCount(null);
    setSubmitError(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const readyRows = matched?.results.filter((r) => r.kind === "ready") || [];
  const missingCount = matched?.missingStudents.length || 0;
  const canSubmit = readyRows.length > 0 && (mode === "update" || missingCount === 0 || fillMissingAsAbsent);
  const isSubmitting = markMutation.isPending || updateMutation.isPending;

  async function handleSubmit() {
    setSubmitError(null);
    try {
      if (mode === "create") {
        const entries = readyRows.map((r) => ({ student_id: r.student.id, status: r.status, remarks: r.remarks || null }));
        if (missingCount > 0 && fillMissingAsAbsent) {
          matched.missingStudents.forEach((s) => entries.push({ student_id: s.id, status: "absent", remarks: null }));
        }
        await markMutation.mutateAsync(entries);
        setSuccessCount(entries.length);
      } else {
        await Promise.all(
          readyRows.map((r) => updateMutation.mutateAsync({ attendanceId: r.attendanceId, payload: { status: r.status, remarks: r.remarks || null } }))
        );
        setSuccessCount(readyRows.length);
      }
    } catch (err) {
      setSubmitError(err.message || "Couldn't import attendance.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="card animate-fade-up flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-tint)] text-[var(--accent)]">
              <Upload size={17} strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[var(--ink)]">Import Attendance from Excel</h2>
              <p className="text-xs text-[var(--ink-soft)]">Upload a spreadsheet to bulk-mark or update attendance.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-[var(--ink-faint)] hover:bg-[var(--bg)] hover:text-[var(--ink)]">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {successCount !== null ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--present-tint)] text-[var(--present)]">
                <CheckCircle2 size={24} strokeWidth={2} />
              </span>
              <h3 className="text-base font-bold text-[var(--ink)]">
                {mode === "create" ? "Attendance saved" : "Attendance updated"}
              </h3>
              <p className="text-sm text-[var(--ink-soft)]">
                {successCount} record{successCount === 1 ? "" : "s"} {mode === "create" ? "saved" : "updated"} for{" "}
                <span className="font-medium text-[var(--ink)]">{selectedClass?.name}</span> on {date}.
              </p>
              <div className="mt-3 flex gap-2">
                <button onClick={reset} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)]">
                  Import another file
                </button>
                <button onClick={onClose} className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]">
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--ink-soft)]">Class</label>
                  <select
                    value={effectiveClassId}
                    onChange={(e) => {
                      setClassId(e.target.value);
                      reset();
                    }}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] focus:border-[var(--accent)]"
                  >
                    {classes?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.section ? ` — Section ${c.section}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--ink-soft)]">Date</label>
                  <input
                    type="date"
                    value={date}
                    max={todayISO()}
                    onChange={(e) => {
                      setDate(e.target.value);
                      reset();
                    }}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadAttendanceTemplate(roster, selectedClass?.name, date)}
                  disabled={rosterQuery.isLoading || roster.length === 0}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] disabled:opacity-50"
                >
                  <Download size={15} strokeWidth={2} />
                  Download blank template
                </button>
                <span className="text-xs text-[var(--ink-faint)]">Pre-filled with this class's roster and roll numbers.</span>
              </div>

              <label
                htmlFor="attendance-file"
                className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--border)] px-6 py-8 text-center hover:border-[var(--accent)] hover:bg-[var(--accent-tint)]/30"
              >
                <FileSpreadsheet size={22} strokeWidth={2} className="text-[var(--ink-faint)]" />
                <span className="text-sm font-medium text-[var(--ink)]">{fileName || "Click to upload a .xlsx, .xls, or .csv file"}</span>
                <span className="text-xs text-[var(--ink-faint)]">Needs a Roll Number column and a Status column.</span>
                <input
                  ref={fileInputRef}
                  id="attendance-file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFile}
                  className="sr-only"
                />
              </label>

              {parseError && (
                <div className="mt-4">
                  <ErrorBanner message={parseError} />
                </div>
              )}
              {submitError && (
                <div className="mt-4">
                  <ErrorBanner message={submitError} />
                </div>
              )}

              {attendanceQuery.isLoading && parsedRows && (
                <div className="mt-4">
                  <Spinner label="Checking existing records for this date" />
                </div>
              )}

              {matched && !attendanceQuery.isLoading && (
                <div className="mt-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium">
                    <span className="status-pill status-present">{readyRows.length} ready</span>
                    {matched.results.some((r) => r.kind === "unmatched") && (
                      <span className="status-pill status-late">
                        {matched.results.filter((r) => r.kind === "unmatched").length} unmatched roll number
                      </span>
                    )}
                    {matched.results.some((r) => r.kind === "invalid-status") && (
                      <span className="status-pill status-absent">
                        {matched.results.filter((r) => r.kind === "invalid-status").length} invalid status
                      </span>
                    )}
                    {matched.results.some((r) => r.kind === "no-existing-record") && (
                      <span className="status-pill status-late">
                        {matched.results.filter((r) => r.kind === "no-existing-record").length} no existing record to update
                      </span>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto rounded-lg border border-[var(--border)]">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-[var(--bg)] text-xs font-semibold text-[var(--ink-soft)]">
                        <tr>
                          <th className="px-3 py-2">Roll No.</th>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-soft)]">
                        {matched.results.map((row) => (
                          <tr key={row.line}>
                            <td className="px-3 py-2 font-mono-tab text-[var(--ink-soft)]">{row.rollNumber || "—"}</td>
                            <td className="px-3 py-2 text-[var(--ink)]">{row.student?.full_name || "—"}</td>
                            <td className="px-3 py-2 text-[var(--ink-soft)]">{row.status ? STATUS_LABEL[row.status] : row.statusRaw || "—"}</td>
                            <td className="px-3 py-2">
                              <RowResult kind={row.kind} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {mode === "create" && missingCount > 0 && (
                    <label className="mt-3 flex items-start gap-2 rounded-lg bg-[var(--late-tint)] px-3 py-2.5 text-sm text-[var(--ink)]">
                      <input
                        type="checkbox"
                        checked={fillMissingAsAbsent}
                        onChange={(e) => setFillMissingAsAbsent(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="font-medium">
                          {missingCount} student{missingCount === 1 ? "" : "s"} on the roster {missingCount === 1 ? "isn't" : "aren't"} in this file.
                        </span>{" "}
                        This is a first-time submission for {date}, and every student needs a status. Check this to mark them{" "}
                        <strong>Absent</strong>, or add them to the file and re-upload.
                      </span>
                    </label>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {successCount === null && (
          <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4">
            <p className="text-xs text-[var(--ink-faint)]">
              {mode === "create" ? "First submission for this date — saves all at once." : "Records already exist for this date — matched rows will be updated."}
            </p>
            <div className="flex gap-2">
              <button onClick={onClose} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)]">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
              >
                {isSubmitting ? "Importing…" : `Import ${readyRows.length || ""} Record${readyRows.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RowResult({ kind }) {
  if (kind === "ready") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-[var(--present)]">
        <CheckCircle2 size={13} strokeWidth={2} /> Ready
      </span>
    );
  }
  if (kind === "unmatched") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-[var(--late)]">
        <AlertTriangle size={13} strokeWidth={2} /> No student with that roll number
      </span>
    );
  }
  if (kind === "no-existing-record") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-[var(--late)]">
        <AlertTriangle size={13} strokeWidth={2} /> Nothing to update
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-[var(--absent)]">
      <XCircle size={13} strokeWidth={2} /> Unrecognized status
    </span>
  );
}
