import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchMyClasses, fetchClassRoster } from "../services/classService";
import { fetchAttendance } from "../services/attendanceService";
import { todayISO, lastNDatesISO } from "../utils/date";

const TREND_DAYS = 6;

// There's no dedicated dashboard-summary endpoint on the backend, so this
// hook builds the dashboard entirely from real data returned by the existing
// classes/roster/attendance endpoints (same queryKeys as useClasses/
// useAttendance, so results are shared with the rest of the app's cache).
// Nothing here is synthetic — a class with no attendance marked yet just
// contributes zero to the totals instead of showing a fake number.
export function useDashboard() {
  const today = todayISO();
  const trendDates = useMemo(() => lastNDatesISO(TREND_DAYS), [today]); // eslint-disable-line react-hooks/exhaustive-deps

  const classesQuery = useQuery({ queryKey: ["classes"], queryFn: fetchMyClasses });
  const classes = classesQuery.data ?? [];
  const classIds = classes.map((c) => c.id);

  const rosterQueries = useQueries({
    queries: classIds.map((id) => ({
      queryKey: ["roster", id],
      queryFn: () => fetchClassRoster(id),
      enabled: !!id,
    })),
  });

  const todayAttendanceQueries = useQueries({
    queries: classIds.map((id) => ({
      queryKey: ["attendance", id, today],
      queryFn: () => fetchAttendance(id, today),
      enabled: !!id,
    })),
  });

  const trendQueries = useQueries({
    queries: classIds.flatMap((id) =>
      trendDates.map((date) => ({
        queryKey: ["attendance", id, date],
        queryFn: () => fetchAttendance(id, date),
        enabled: !!id,
      }))
    ),
  });

  const isLoading =
    classesQuery.isLoading || rosterQueries.some((q) => q.isLoading) || todayAttendanceQueries.some((q) => q.isLoading);
  const isError = classesQuery.isError || rosterQueries.some((q) => q.isError) || todayAttendanceQueries.some((q) => q.isError);
  const trendLoading = trendQueries.some((q) => q.isLoading);

  const classesWithStats = useMemo(
    () =>
      classes.map((cls, i) => {
        const roster = rosterQueries[i]?.data ?? [];
        const records = todayAttendanceQueries[i]?.data?.records ?? [];
        return {
          ...cls,
          studentCount: roster.length,
          recordsToday: records,
          markedToday: records.length > 0,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classes, rosterQueries.map((q) => q.dataUpdatedAt).join(","), todayAttendanceQueries.map((q) => q.dataUpdatedAt).join(",")]
  );

  const totalStudents = classesWithStats.reduce((sum, c) => sum + c.studentCount, 0);
  const completedToday = classesWithStats.filter((c) => c.markedToday).length;
  const pendingToday = Math.max(classesWithStats.length - completedToday, 0);

  const overview = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, leave: 0 };
    classesWithStats.forEach((c) => {
      c.recordsToday.forEach((r) => {
        if (counts[r.status] !== undefined) counts[r.status] += 1;
      });
    });
    const total = counts.present + counts.absent + counts.late + counts.leave;
    return { counts, total };
  }, [classesWithStats]);

  const trend = useMemo(() => {
    if (classIds.length === 0) return trendDates.map((date) => ({ date, rate: null }));
    return trendDates.map((date, dayIdx) => {
      let present = 0;
      let total = 0;
      classIds.forEach((_, classIdx) => {
        const q = trendQueries[classIdx * trendDates.length + dayIdx];
        const records = q?.data?.records ?? [];
        total += records.length;
        present += records.filter((r) => r.status === "present" || r.status === "late").length;
      });
      return { date, rate: total === 0 ? null : Math.round((present / total) * 100) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classIds.join(","), trendQueries.map((q) => q.dataUpdatedAt).join(","), trendDates]);

  return {
    classes: classesWithStats,
    isLoading,
    isError,
    error: classesQuery.error,
    totalClasses: classesWithStats.length,
    totalStudents,
    completedToday,
    pendingToday,
    overview,
    trend,
    trendLoading,
  };
}
