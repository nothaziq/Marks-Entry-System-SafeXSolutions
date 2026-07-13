import { Link } from "react-router-dom";
import { useClasses } from "../hooks/useClasses";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";

export default function ClassesPage() {
  const { data: classes, isLoading, isError, error } = useClasses();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Your classes</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Pick a class to mark or review attendance.</p>
      </div>

      {isLoading && <Spinner label="Loading your classes" />}
      {isError && <ErrorBanner message={error?.message || "Couldn't load your classes."} />}

      {classes && classes.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--line)] px-6 py-12 text-center text-[var(--ink-soft)]">
          No classes are assigned to you yet. Once a class is added, it'll show up here.
        </div>
      )}

      {classes && classes.length > 0 && (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {classes.map((cls) => (
            <li key={cls.id}>
              <Link
                to={`/attendance/${cls.id}`}
                className="group flex flex-col gap-1 rounded-lg border border-[var(--line)] bg-[var(--paper-raised)]
                           p-5 transition-colors hover:border-[var(--primary)]"
              >
                <span className="font-display text-lg font-semibold group-hover:text-[var(--primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  {cls.name}
                </span>
                {cls.section && (
                  <span className="font-mono-tab text-xs uppercase tracking-wide text-[var(--ink-soft)]">
                    Section {cls.section}
                  </span>
                )}
                <span className="mt-2 text-sm font-medium text-[var(--primary)]">Open register →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
