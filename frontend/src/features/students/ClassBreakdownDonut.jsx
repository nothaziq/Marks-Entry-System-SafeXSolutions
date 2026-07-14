const PALETTE = ["#4f46e5", "#16a34a", "#d97706", "#7c3aed", "#0ea5e9", "#db2777", "#059669", "#e11d48"];

const SIZE = 132;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ClassBreakdownDonut({ breakdown, total }) {
  if (!total) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="No students yet">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
        </svg>
        <p className="max-w-[16rem] text-center text-xs text-[var(--ink-faint)]">
          No students yet. Once a roster is added to a class, the breakdown shows up here.
        </p>
      </div>
    );
  }

  let offset = 0;
  const arcs = breakdown.map((seg, i) => {
    const fraction = seg.count / total;
    const dash = fraction * CIRCUMFERENCE;
    const arc = { ...seg, color: PALETTE[i % PALETTE.length], dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Students by class: ${total} total`}>
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--border-soft)" strokeWidth={STROKE} />
            {arcs
              .filter((a) => a.count > 0)
              .map((a) => (
                <circle
                  key={a.id}
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
      </div>

      <ul className="space-y-2">
        {arcs.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-[var(--ink-soft)]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: a.color }} aria-hidden="true" />
              <span className="truncate">{a.label}</span>
            </span>
            <span className="shrink-0 font-semibold text-[var(--ink)]">{a.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
