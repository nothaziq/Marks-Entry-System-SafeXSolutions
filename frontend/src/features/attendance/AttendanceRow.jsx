import StatusSelect from "../../components/StatusSelect";

export default function AttendanceRow({ index, row, onChange }) {
  const isDirty = row.status !== row.savedStatus || row.remarks !== row.savedRemarks;

  return (
    <div
      className="grid grid-cols-[2rem_5rem_1fr] items-center gap-3 border-b border-[var(--border-soft)] px-5 py-3.5 transition-colors duration-150 last:border-b-0 hover:bg-[var(--bg)]/60 sm:grid-cols-[2rem_6rem_1fr_9rem_1fr]"
    >
      <span className="text-sm text-[var(--ink-faint)]">{index}</span>
      <span className="font-mono-tab text-sm text-[var(--ink-soft)]">{row.rollNumber}</span>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--ink)]">
          {row.fullName}
          {isDirty && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--late)]" title="Unsaved change" />}
        </p>
      </div>

      <div className="col-span-2 grid grid-cols-2 gap-3 sm:col-span-1 sm:contents">
        <StatusSelect label={`Status for ${row.fullName}`} value={row.status} onChange={(status) => onChange({ ...row, status })} />

        <input
          type="text"
          value={row.remarks || ""}
          onChange={(e) => onChange({ ...row, remarks: e.target.value })}
          placeholder="Optional remarks"
          aria-label={`Remarks for ${row.fullName}`}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)]"
        />
      </div>
    </div>
  );
}
