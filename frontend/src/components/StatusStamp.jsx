const DOT = {
  present: "●",
  absent: "●",
  late: "●",
  leave: "●",
};

export default function StatusStamp({ status }) {
  if (!status) return <span className="text-sm text-[var(--ink-soft)]">—</span>;
  return (
    <span className={`stamp stamp-${status}`}>
      <span aria-hidden="true">{DOT[status]}</span>
      {status}
    </span>
  );
}
