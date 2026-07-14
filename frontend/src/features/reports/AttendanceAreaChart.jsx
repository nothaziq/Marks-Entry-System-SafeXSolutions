const WIDTH = 900;
const HEIGHT = 240;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;
const PAD_TOP = 26;
const PAD_BOTTOM = 28;

const GRID_LINES = [0, 25, 50, 75, 100];

export default function AttendanceAreaChart({ points, isLoading }) {
  if (isLoading) {
    return <div className="flex h-[240px] items-center justify-center text-sm text-[var(--ink-faint)]">Loading trend…</div>;
  }

  const known = points.filter((p) => p.rate !== null);
  if (known.length < 2) {
    return (
      <div className="flex h-[240px] items-center justify-center px-4 text-center text-sm text-[var(--ink-faint)]">
        Not enough attendance data in this range yet. Mark a few more days to see a trend here.
      </div>
    );
  }

  const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;
  const yFor = (rate) => PAD_TOP + (1 - rate / 100) * innerHeight;

  const plotted = points.map((p, i) => ({ ...p, x: PAD_LEFT + i * step, y: p.rate === null ? null : yFor(p.rate) }));
  const linePoints = plotted.filter((p) => p.y !== null);
  const linePath = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${linePoints[linePoints.length - 1].x} ${PAD_TOP + innerHeight} L ${linePoints[0].x} ${
    PAD_TOP + innerHeight
  } Z`;

  const showPointLabels = points.length <= 12;
  const xLabelStep = Math.max(1, Math.ceil(points.length / 7));

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Attendance rate trend">
      <defs>
        <linearGradient id="reportsAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--present)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--present)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {GRID_LINES.map((g) => {
        const y = yFor(g);
        return (
          <g key={g}>
            <line x1={PAD_LEFT} y1={y} x2={WIDTH - PAD_RIGHT} y2={y} stroke="var(--border-soft)" strokeWidth="1" />
            <text x={PAD_LEFT - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--ink-faint)">
              {g}%
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#reportsAreaFill)" stroke="none" />
      <path d={linePath} fill="none" stroke="var(--present)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {linePoints.map((p) => (
        <circle key={p.key} cx={p.x} cy={p.y} r="3" fill="var(--present)" />
      ))}

      {showPointLabels &&
        linePoints.map((p) => (
          <text key={`${p.key}-label`} x={p.x} y={p.y - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ink-soft)">
            {p.rate}%
          </text>
        ))}

      {plotted.map((p, i) =>
        i % xLabelStep === 0 || i === plotted.length - 1 ? (
          <text key={`${p.key}-x`} x={p.x} y={HEIGHT - 8} textAnchor="middle" fontSize="10" fill="var(--ink-faint)">
            {p.label}
          </text>
        ) : null
      )}
    </svg>
  );
}
