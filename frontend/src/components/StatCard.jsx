export default function StatCard({ icon: Icon, label, value, sublabel, tint }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `var(--${tint}-tint)`, color: `var(--${tint})` }}
      >
        <Icon size={19} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-[var(--ink-soft)]">{label}</p>
        <p className="text-xl font-bold leading-tight text-[var(--ink)]">{value}</p>
        {sublabel && <p className="text-xs text-[var(--ink-faint)]">{sublabel}</p>}
      </div>
    </div>
  );
}
