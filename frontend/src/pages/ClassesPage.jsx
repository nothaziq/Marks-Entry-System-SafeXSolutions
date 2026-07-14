import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { useClasses } from "../hooks/useClasses";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";

export default function ClassesPage() {
  const { data: classes, isLoading, isError, error } = useClasses();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-[var(--ink)]">Your Classes</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Pick a class to mark or review attendance.</p>
      </div>

      {isLoading && <Spinner label="Loading your classes" />}
      {isError && <ErrorBanner message={error?.message || "Couldn't load your classes."} />}

      {classes && classes.length === 0 && (
        <div className="card px-6 py-12 text-center text-[var(--ink-soft)]">
          No classes are assigned to you yet. Once a class is added, it'll show up here.
        </div>
      )}

      {classes && classes.length > 0 && (
        <ul className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <li key={cls.id}>
              <Link
                to={`/attendance/${cls.id}`}
                className="card group flex flex-col gap-3 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md active:translate-y-0"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-tint)] text-[var(--accent)]">
                  <BookOpen size={18} strokeWidth={2} />
                </span>
                <div>
                  <p className="text-base font-bold text-[var(--ink)]">{cls.name}</p>
                  {cls.section && <p className="text-xs text-[var(--ink-soft)]">Section {cls.section}</p>}
                </div>
                <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">
                  Take attendance
                  <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
