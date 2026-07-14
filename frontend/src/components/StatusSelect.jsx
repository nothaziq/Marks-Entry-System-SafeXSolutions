import { STATUS_OPTIONS } from "../utils/constants";

const STATUS_CLASS = {
  present: "status-present",
  absent: "status-absent",
  late: "status-late",
  leave: "status-leave",
};

export default function StatusSelect({ value, onChange, disabled, label }) {
  return (
    <select
      aria-label={label || "Attendance status"}
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`status-pill w-full cursor-pointer appearance-none pr-6 disabled:cursor-not-allowed disabled:opacity-50 ${
        value ? STATUS_CLASS[value] : ""
      }`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2398A2B3' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.6rem center",
      }}
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
