import { STATUS_OPTIONS } from "../utils/constants";

export default function StatusSelect({ value, onChange, disabled, label }) {
  return (
    <select
      aria-label={label || "Attendance status"}
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-[var(--line)] bg-white px-2.5 py-1.5 text-sm font-medium
                 text-[var(--ink)] focus:border-[var(--primary)] disabled:opacity-50"
    >
      <option value="" disabled>
        Select status
      </option>
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
