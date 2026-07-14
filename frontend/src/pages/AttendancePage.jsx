import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { useClasses, useClassRoster } from "../hooks/useClasses";
import { useAttendance, useAttendanceMutations } from "../hooks/useAttendance";
import AttendanceRegister from "../features/attendance/AttendanceRegister";
import Spinner from "../components/Spinner";
import ErrorBanner from "../components/ErrorBanner";
import { todayISO } from "../utils/date";

export default function AttendancePage() {
  const { classId } = useParams();
  const navigate = useNavigate();
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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[var(--ink)]">Take Attendance</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Mark attendance for your class and save records.</p>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 whitespace-nowrap text-sm text-[var(--ink-soft)]">
          <CalendarCheck size={15} strokeWidth={2} />
          <span>Attendance</span>
          <ChevronRight size={14} strokeWidth={2} />
          <span className="font-medium text-[var(--ink)]">Take Attendance</span>
        </div>
      </div>

      <div className="card mb-6 grid animate-fade-up grid-cols-1 gap-4 p-5 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor="class-select" className="mb-1.5 block text-xs font-semibold text-[var(--ink-soft)]">
            Class
          </label>
          <select
            id="class-select"
            value={classId}
            onChange={(e) => navigate(`/attendance/${e.target.value}`)}
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--ink)] focus:border-[var(--accent)]"
          >
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.section ? ` — Section ${c.section}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="attendance-date" className="mb-1.5 block text-xs font-semibold text-[var(--ink-soft)]">
            Date
          </label>
          <input
            id="attendance-date"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {isLoading && <Spinner label="Loading the class register" />}
      {loadError && <ErrorBanner message={loadError.message || "Couldn't load this class."} />}

      {!isLoading && !loadError && rosterQuery.data && attendanceQuery.data && (
        <AttendanceRegister
          key={`${classId}-${date}`}
          classId={classId}
          className={cls?.name}
          date={date}
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
