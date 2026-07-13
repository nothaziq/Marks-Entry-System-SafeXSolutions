export default function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[var(--ink-soft)]">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--primary)]"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
