import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useClasses, useClassRoster } from "../hooks/useClasses";
import { useAttendance, useAttendanceMutations } from "../hooks/useAttendance";
import AttendanceRegister from "../features/attendance/AttendanceRegister";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";
import { todayISO, formatDisplayDate } from "../utils/date";

export default function AttendancePage() {
  const { classId } = useParams();
  const [date, setDate] = useState(todayISO());

  const { data: classes } = useClasses();
  const cls = classes?.find((c) => c.id === classId);

  const rosterQuery = useClassRoster(classId);
  const attendanceQuery = useAttendance(classId, date);
  const { markMutation, updateMutation } = useAttendanceMutations(classId, date);

  const isLoading = rosterQuery.isLoading || attendanceQuery.isLoading;
  const loadError = rosterQuery.error || attendanceQuery.error;

  return (
    <div>
      <Link to="/classes" className="mb-4 inline-block text-sm font-medium text-[var(--primary)]">
        ← All classes
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{cls ? cls.name : "Attendance"}</h1>
          {cls?.section && <p className="text-sm text-[var(--ink-soft)]">Section {cls.section}</p>}
        </div>

        <div>
          <label htmlFor="attendance-date" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
            Date
          </label>
          <input
            id="attendance-date"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-[var(--line)] px-3 py-2 text-sm focus:border-[var(--primary)]"
          />
          <p className="mt-1 font-mono-tab text-xs text-[var(--ink-soft)]">{formatDisplayDate(date)}</p>
        </div>
      </div>

      {isLoading && <Spinner label="Loading the class register" />}
      {loadError && <ErrorBanner message={loadError.message || "Couldn't load this class."} />}

      {!isLoading && !loadError && rosterQuery.data && attendanceQuery.data && (
        <AttendanceRegister
          key={`${classId}-${date}`}
          roster={rosterQuery.data}
          records={attendanceQuery.data.records}
          onSubmitAll={(entries) => markMutation.mutateAsync(entries)}
          onUpdateOne={(attendanceId, payload) => updateMutation.mutateAsync({ attendanceId, payload })}
          isSubmitting={markMutation.isPending}
          isUpdating={updateMutation.isPending}
        />
      )}
    </div>
  );
}
