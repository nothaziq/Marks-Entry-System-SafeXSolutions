const SEGMENTS = [
  { key: "present", label: "Present", color: "var(--present)" },
  { key: "absent", label: "Absent", color: "var(--absent)" },
  { key: "late", label: "Late", color: "var(--late)" },
  { key: "leave", label: "Leave", color: "var(--leave)" },
];

const SIZE = 132;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function AttendanceDonut({ counts, total }) {
  if (!total) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="No attendance marked yet today">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
        </svg>
        <p className="max-w-[16rem] text-center text-xs text-[var(--ink-faint)]">
          No attendance marked yet today. Once you take attendance, the breakdown shows up here.
        </p>
      </div>
    );
  }

  let offset = 0;
  const arcs = SEGMENTS.map((seg) => {
    const value = counts[seg.key] || 0;
    const fraction = value / total;
    const dash = fraction * CIRCUMFERENCE;
    const arc = { ...seg, value, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex items-center gap-5">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Attendance overview: ${total} records today`}>
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--border-soft)" strokeWidth={STROKE} />
          {arcs
            .filter((a) => a.value > 0)
            .map((a) => (
              <circle
                key={a.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={a.color}
                strokeWidth={STROKE}
                strokeDasharray={`${a.dash} ${CIRCUMFERENCE - a.dash}`}
                strokeDashoffset={-a.offset}
                strokeLinecap="butt"
              />
            ))}
        </g>
        <text x="50%" y="47%" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--ink)">
          {total}
        </text>
        <text x="50%" y="63%" textAnchor="middle" fontSize="10" fill="var(--ink-soft)">
          Total
        </text>
      </svg>

      <ul className="flex-1 space-y-2">
        {arcs.map((a) => (
          <li key={a.key} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-[var(--ink-soft)]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: a.color }} aria-hidden="true" />
              {a.label}
            </span>
            <span className="font-semibold text-[var(--ink)]">
              {a.value} <span className="font-normal text-[var(--ink-faint)]">({Math.round((a.value / total) * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
