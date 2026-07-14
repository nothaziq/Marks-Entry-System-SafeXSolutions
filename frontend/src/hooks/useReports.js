import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchMyClasses, fetchClassRoster } from "../services/classService";
import { fetchAttendance } from "../services/attendanceService";
import { datesBetween } from "../utils/date";

// There's no aggregate/report endpoint on the backend, so this hook builds a
// report from real per-class, per-day attendance — one request per class per
// day in the selected range (same queryKeys used everywhere else in the app,
// so results are shared with the Dashboard/Classes/Attendance caches).
// A class with no records in a given day just contributes zero; nothing here
// is synthesized.
export function useReports({ from, to, classIds }) {
  const dates = useMemo(() => datesBetween(from, to), [from, to]);

  const classesQuery = useQuery({ queryKey: ["classes"], queryFn: fetchMyClasses });
  const allClasses = classesQuery.data ?? [];
  const activeClasses = classIds && classIds.length > 0 ? allClasses.filter((c) => classIds.includes(c.id)) : allClasses;

  const rosterQueries = useQueries({
    queries: activeClasses.map((c) => ({
      queryKey: ["roster", c.id],
      queryFn: () => fetchClassRoster(c.id),
      enabled: !!c.id,
    })),
  });

  const attendanceQueries = useQueries({
    queries: activeClasses.flatMap((c) =>
      dates.map((date) => ({
        queryKey: ["attendance", c.id, date],
        queryFn: () => fetchAttendance(c.id, date),
        enabled: !!c.id,
      }))
    ),
  });

  const isLoading =
    classesQuery.isLoading || rosterQueries.some((q) => q.isLoading) || (dates.length > 0 && attendanceQueries.some((q) => q.isLoading));
  const isError = classesQuery.isError || rosterQueries.some((q) => q.isError) || attendanceQueries.some((q) => q.isError);

  const rosterKey = rosterQueries.map((q) => q.dataUpdatedAt).join(",");
  const attendanceKey = attendanceQueries.map((q) => q.dataUpdatedAt).join(",");

  const perClass = useMemo(
    () =>
      activeClasses.map((cls, classIdx) => {
        const roster = rosterQueries[classIdx]?.data ?? [];
        const counts = { present: 0, absent: 0, late: 0, leave: 0 };
        let daysWithRecords = 0;
        dates.forEach((_, dayIdx) => {
          const records = attendanceQueries[classIdx * dates.length + dayIdx]?.data?.records ?? [];
          if (records.length > 0) daysWithRecords += 1;
          records.forEach((r) => {
            if (counts[r.status] !== undefined) counts[r.status] += 1;
          });
        });
        const total = counts.present + counts.absent + counts.late + counts.leave;
        const rate = total === 0 ? null : Math.round(((counts.present + counts.late) / total) * 100);
        return { ...cls, studentCount: roster.length, counts, total, rate, daysWithRecords };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeClasses, rosterKey, attendanceKey, dates]
  );

  const totals = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, leave: 0 };
    perClass.forEach((c) => {
      Object.keys(counts).forEach((k) => {
        counts[k] += c.counts[k];
      });
    });
    const total = counts.present + counts.absent + counts.late + counts.leave;
    const rate = total === 0 ? null : Math.round(((counts.present + counts.late) / total) * 100);
    return { counts, total, rate };
  }, [perClass]);

  const totalStudents = perClass.reduce((sum, c) => sum + c.studentCount, 0);

  const dailyTrend = useMemo(
    () =>
      dates.map((date, dayIdx) => {
        let present = 0;
        let total = 0;
        activeClasses.forEach((_, classIdx) => {
          const records = attendanceQueries[classIdx * dates.length + dayIdx]?.data?.records ?? [];
          total += records.length;
          present += records.filter((r) => r.status === "present" || r.status === "late").length;
        });
        return { date, rate: total === 0 ? null : Math.round((present / total) * 100) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeClasses, dates, attendanceKey]
  );

  const topClasses = useMemo(
    () =>
      [...perClass]
        .filter((c) => c.rate !== null)
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 3),
    [perClass]
  );

  return {
    allClasses,
    perClass,
    totals,
    totalStudents,
    dailyTrend,
    topClasses,
    dates,
    isLoading,
    isError,
    error: classesQuery.error,
  };
}
