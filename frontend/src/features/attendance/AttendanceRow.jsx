import StatusSelect from "../../components/StatusSelect";
import StatusStamp from "../../components/StatusStamp";

export default function AttendanceRow({ row, onChange, mode }) {
  const isDirty = row.status !== row.savedStatus || row.remarks !== row.savedRemarks;

  return (
    <div
      className="grid grid-cols-[auto_1fr] items-start gap-3 border-b border-[var(--line)] py-3
                 sm:grid-cols-[3rem_1fr_9rem_1fr] sm:items-center sm:gap-4"
    >
      <span className="font-mono-tab text-xs text-[var(--ink-soft)]">{row.rollNumber}</span>

      <div className="min-w-0">
        <p className="truncate font-medium text-[var(--ink)]">{row.fullName}</p>
        {mode === "saved" && (
          <div className="mt-1 sm:hidden">
            <StatusStamp status={row.savedStatus} />
          </div>
        )}
      </div>

      <StatusSelect
        label={`Status for ${row.fullName}`}
        value={row.status}
        onChange={(status) => onChange({ ...row, status })}
      />

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={row.remarks || ""}
          onChange={(e) => onChange({ ...row, remarks: e.target.value })}
          placeholder="Remarks (optional)"
          aria-label={`Remarks for ${row.fullName}`}
          className="w-full rounded-md border border-[var(--line)] px-2.5 py-1.5 text-sm focus:border-[var(--primary)]"
        />
        {mode === "saved" && isDirty && (
          <span className="shrink-0 text-xs font-medium text-[var(--late)]" title="Unsaved change">
            ●
          </span>
        )}
      </div>
    </div>
  );
}
