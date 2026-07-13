import { useState } from "react";
import AttendanceRow from "./AttendanceRow";
import ErrorBanner from "../../components/ErrorBanner";

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

export default function AttendanceRegister({ roster, records, onSubmitAll, onUpdateOne, isSubmitting, isUpdating }) {
  const [rows, setRows] = useState(() => buildRows(roster, records));
  const [formError, setFormError] = useState(null);

  const mode = records.length > 0 ? "saved" : "draft";
  const dirtyRows = rows.filter((r) => r.status !== r.savedStatus || r.remarks !== r.savedRemarks);
  const allStatusesSet = rows.every((r) => !!r.status);

  function updateRow(updated) {
    setRows((prev) => prev.map((r) => (r.studentId === updated.studentId ? updated : r)));
  }

  async function handleBulkSave() {
    setFormError(null);
    if (!allStatusesSet) {
      setFormError("Every student on the roster needs a status before you can save.");
      return;
    }
    try {
      await onSubmitAll(
        rows.map((r) => ({ student_id: r.studentId, status: r.status, remarks: r.remarks || null }))
      );
      setRows((prev) => prev.map((r) => ({ ...r, savedStatus: r.status, savedRemarks: r.remarks })));
    } catch (err) {
      setFormError(err.message || "Couldn't save attendance.");
    }
  }

  async function handleSaveChanges() {
    setFormError(null);
    try {
      await Promise.all(
        dirtyRows
          .filter((r) => r.attendanceId)
          .map((r) => onUpdateOne(r.attendanceId, { status: r.status, remarks: r.remarks || null }))
      );
      setRows((prev) => prev.map((r) => ({ ...r, savedStatus: r.status, savedRemarks: r.remarks })));
    } catch (err) {
      setFormError(err.message || "Couldn't save your changes.");
    }
  }

  if (roster.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--line)] px-6 py-12 text-center text-[var(--ink-soft)]">
        This class has no students on its roster yet.
      </div>
    );
  }

  return (
    <div>
      {formError && (
        <div className="mb-4">
          <ErrorBanner message={formError} />
        </div>
      )}

      {mode === "saved" && (
        <p className="mb-4 text-sm text-[var(--ink-soft)]">
          Attendance for this date is already recorded. Change a status or remark below and save to update it.
        </p>
      )}

      <div className="rounded-lg border border-[var(--line)] bg-[var(--paper-raised)] px-4">
        <div className="hidden border-b border-[var(--line)] py-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)] sm:grid sm:grid-cols-[3rem_1fr_9rem_1fr] sm:gap-4">
          <span>Roll</span>
          <span>Student</span>
          <span>Status</span>
          <span>Remarks</span>
        </div>
        {rows.map((row) => (
          <AttendanceRow key={row.studentId} row={row} onChange={updateRow} mode={mode} />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        {mode === "draft" ? (
          <button
            onClick={handleBulkSave}
            disabled={isSubmitting || !allStatusesSet}
            className="rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white
                       hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Save attendance"}
          </button>
        ) : (
          <button
            onClick={handleSaveChanges}
            disabled={isUpdating || dirtyRows.length === 0}
            className="rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white
                       hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {isUpdating ? "Saving…" : dirtyRows.length > 0 ? `Save ${dirtyRows.length} change(s)` : "No changes to save"}
          </button>
        )}
      </div>
    </div>
  );
}
