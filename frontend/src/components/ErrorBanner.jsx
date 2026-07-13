export default function ErrorBanner({ message, errors = [] }) {
  if (!message && errors.length === 0) return null;
  return (
    <div role="alert" className="rounded-md border border-[var(--absent)] bg-[var(--absent-tint)] px-4 py-3 text-sm text-[var(--absent)]">
      <p className="font-semibold">{message}</p>
      {errors.length > 0 && (
        <ul className="mt-1 list-inside list-disc">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
