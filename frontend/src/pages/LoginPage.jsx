import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import ErrorBanner from "../components/ErrorBanner";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || "/classes"} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || "/classes", { replace: true });
    } catch (err) {
      setError(err.message || "Couldn't log you in. Check your email and password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-sm border-2 border-[var(--primary)]
                       font-mono-tab text-sm font-bold text-[var(--primary)]"
            aria-hidden="true"
          >
            R
          </span>
          <h1 className="text-2xl font-semibold">Register</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Sign in to mark attendance for your classes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-[var(--line)] bg-[var(--paper-raised)] p-6">
          {error && <ErrorBanner message={error} />}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--ink)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm focus:border-[var(--primary)]"
              placeholder="haziq@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--ink)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm focus:border-[var(--primary)]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white
                       hover:bg-[var(--primary-dark)] disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
