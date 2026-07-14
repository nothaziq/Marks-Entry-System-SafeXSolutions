import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../store/AuthContext";
import ErrorBanner from "../components/ErrorBanner";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex min-h-full items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-white"
            aria-hidden="true"
          >
            <GraduationCap size={22} strokeWidth={2.25} />
          </span>
          <h1 className="text-2xl font-extrabold text-[var(--ink)]">Marks Entry</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Sign in to mark attendance for your classes.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          {error && <ErrorBanner message={error} />}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm focus:border-[var(--accent)]"
              placeholder="haziq@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 pr-10 text-sm focus:border-[var(--accent)]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-[var(--ink-faint)] hover:text-[var(--ink-soft)]"
              >
                <span className="relative block h-[17px] w-[17px]">
                  <Eye
                    size={17}
                    strokeWidth={2}
                    className={`absolute inset-0 transition-all duration-200 ease-out ${
                      showPassword ? "rotate-45 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
                    }`}
                  />
                  <EyeOff
                    size={17}
                    strokeWidth={2}
                    className={`absolute inset-0 transition-all duration-200 ease-out ${
                      showPassword ? "rotate-0 scale-100 opacity-100" : "-rotate-45 scale-75 opacity-0"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
