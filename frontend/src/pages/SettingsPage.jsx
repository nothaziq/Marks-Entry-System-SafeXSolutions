import { useState } from "react";
import {
  UserCircle,
  Bell,
  SlidersHorizontal,
  CloudUpload,
  ShieldCheck,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../store/AuthContext";
import { changePassword } from "../services/authService";
import ErrorBanner from "../components/ErrorBanner";

const PREFS_KEY = "attendance_local_prefs";

const DEFAULT_PREFS = {
  emailNotifications: true,
  attendanceReminders: true,
  weeklyDigest: false,
  language: "English (US)",
  dateFormat: "MMM DD, YYYY",
  timeFormat: "12 Hour (AM/PM)",
};

function loadLocalPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const TABS = [
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { key: "backup", label: "Backup & Export", icon: CloudUpload },
];

export default function SettingsPage() {
  const { teacher } = useAuth();
  const [activeTab, setActiveTab] = useState("security");

  // --- Password form ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const message = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPasswordSuccess(message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "Couldn't update your password. Please try again.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  // --- Local-only preferences ---
  const [prefs, setPrefs] = useState(loadLocalPrefs);

  function updatePrefs(patch) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-[var(--ink)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Manage your profile, security, and local preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        {/* Tabs */}
        <nav className="card h-fit space-y-1 p-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--accent-tint)] text-[var(--accent)]"
                    : "text-[var(--ink-soft)] hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "security" && (
            <>
              <form onSubmit={handleChangePassword} className="card p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[var(--ink)]">Change Password</h2>
                  <p className="mt-0.5 text-sm text-[var(--ink-soft)]">
                    Update your account password to keep your account secure.
                  </p>
                </div>

                {passwordError && <ErrorBanner message={passwordError} />}
                {passwordSuccess && (
                  <div className="mb-4 rounded-md border border-[var(--present-border)] bg-[var(--present-tint)] px-4 py-3 text-sm font-semibold text-[var(--present)]">
                    {passwordSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Enter current password"
                      className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShieldCheck size={16} strokeWidth={2} />
                    {isSavingPassword ? "Updating…" : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => !prev)}
                    className="flex items-center gap-1.5 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  >
                    {showPasswords ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
                    {showPasswords ? "Hide" : "Show"} passwords
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === "notifications" && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-[var(--ink)]">Notifications</h2>
              <p className="mt-0.5 text-sm text-[var(--ink-soft)]">
                Saved on this device only — there's no notification service wired up yet.
              </p>
              <div className="mt-5 divide-y divide-[var(--border-soft)]">
                <ToggleRow
                  label="Email notifications"
                  description="Get emailed about account activity."
                  checked={prefs.emailNotifications}
                  onChange={(v) => updatePrefs({ emailNotifications: v })}
                />
                <ToggleRow
                  label="Attendance reminders"
                  description="Remind me if I haven't marked attendance for a class."
                  checked={prefs.attendanceReminders}
                  onChange={(v) => updatePrefs({ attendanceReminders: v })}
                />
                <ToggleRow
                  label="Weekly digest"
                  description="A weekly summary of attendance across your classes."
                  checked={prefs.weeklyDigest}
                  onChange={(v) => updatePrefs({ weeklyDigest: v })}
                />
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-[var(--ink)]">Preferences</h2>
              <p className="mt-0.5 text-sm text-[var(--ink-soft)]">
                Saved on this device only. These don't sync across devices yet.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectRow
                  label="Language"
                  value={prefs.language}
                  onChange={(v) => updatePrefs({ language: v })}
                  options={["English (US)", "English (UK)", "Urdu"]}
                />
                <SelectRow
                  label="Date Format"
                  value={prefs.dateFormat}
                  onChange={(v) => updatePrefs({ dateFormat: v })}
                  options={["MMM DD, YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]}
                />
                <SelectRow
                  label="Time Format"
                  value={prefs.timeFormat}
                  onChange={(v) => updatePrefs({ timeFormat: v })}
                  options={["12 Hour (AM/PM)", "24 Hour"]}
                />
              </div>
            </div>
          )}

          {activeTab === "backup" && (
            <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-tint)] text-[var(--accent)]">
                <CloudUpload size={20} strokeWidth={2} />
              </span>
              <h2 className="text-base font-bold text-[var(--ink)]">Backup & Export</h2>
              <p className="max-w-sm text-sm text-[var(--ink-soft)]">
                Exporting attendance records isn't built yet. It'll live here once the backend supports it.
              </p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
              <UserCircle size={16} strokeWidth={2} />
              System Information
            </h3>
            <dl className="space-y-3 text-sm">
              <InfoRow label="Role" value={teacher?.is_admin ? "Admin" : "Teacher"} />
              <InfoRow
                label="Account Status"
                value={
                  <span
                    className={`inline-flex items-center gap-1.5 font-semibold ${
                      teacher?.is_active !== false ? "text-[var(--present)]" : "text-[var(--absent)]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        teacher?.is_active !== false ? "bg-[var(--present)]" : "bg-[var(--absent)]"
                      }`}
                    />
                    {teacher?.is_active !== false ? "Active" : "Inactive"}
                  </span>
                }
              />
              <InfoRow label="Member Since" value={formatDate(teacher?.created_at)} />
            </dl>
          </div>

          <div className="card border-[var(--absent-border)] p-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--absent)]">
              <AlertTriangle size={16} strokeWidth={2} />
              Danger Zone
            </h3>
            <p className="mb-4 text-xs text-[var(--ink-soft)]">
              Account deletion isn't available yet — there's no backend support for it. Contact your
              administrator if you need your account removed.
            </p>
            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[var(--absent-border)] px-4 py-2.5 text-sm font-semibold text-[var(--absent)] opacity-50"
            >
              <Trash2 size={15} strokeWidth={2} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--ink-soft)]">{label}</dt>
      <dd className="font-semibold text-[var(--ink)]">{value}</dd>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-semibold text-[var(--ink)]">{label}</p>
        <p className="text-xs text-[var(--ink-soft)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[var(--accent)]" : "bg-[var(--border)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function SelectRow({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm focus:border-[var(--accent)]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
