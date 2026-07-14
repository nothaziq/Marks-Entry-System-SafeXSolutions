import { shortWeekday } from "../../utils/date";

const WIDTH = 260;
const HEIGHT = 110;
const PAD_X = 14;
const PAD_TOP = 22;
const PAD_BOTTOM = 22;

export default function AttendanceTrend({ data, isLoading }) {
  if (isLoading) {
    return <div className="flex h-[110px] items-center justify-center text-xs text-[var(--ink-faint)]">Loading trend…</div>;
  }

  const known = data?.filter((d) => d.rate !== null) ?? [];
  if (known.length < 2) {
    return (
      <div className="flex h-[110px] items-center justify-center px-2 text-center text-xs text-[var(--ink-faint)]">
        Save attendance on a few more days to see a trend here.
      </div>
    );
  }

  const step = (WIDTH - PAD_X * 2) / (data.length - 1);
  const yFor = (rate) => PAD_TOP + (1 - rate / 100) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const points = data.map((d, i) => ({ ...d, x: PAD_X + i * step, y: d.rate === null ? null : yFor(d.rate) }));
  const linePoints = points.filter((p) => p.y !== null);
  const path = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Attendance rate over the last five days">
      <path d={path} fill="none" stroke="var(--present)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {linePoints.map((p) => (
        <circle key={p.date} cx={p.x} cy={p.y} r="3" fill="var(--present)" />
      ))}
      {linePoints.map((p) => (
        <text key={`${p.date}-label`} x={p.x} y={p.y - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ink-soft)">
          {p.rate}%
        </text>
      ))}
      {points.map((p) => (
        <text key={`${p.date}-day`} x={p.x} y={HEIGHT - 6} textAnchor="middle" fontSize="10" fill="var(--ink-faint)">
          {shortWeekday(p.date)}
        </text>
      ))}
    </svg>
  );
}
