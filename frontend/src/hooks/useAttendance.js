import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAttendance, fetchAttendance, markAttendance, updateAttendance } from "../services/attendanceService";
import { lastNDatesISO } from "../utils/date";

export function useAttendance(classId, date) {
  return useQuery({
    queryKey: ["attendance", classId, date],
    queryFn: () => fetchAttendance(classId, date),
    enabled: !!classId && !!date,
  });
}

export function useAttendanceMutations(classId, date) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["attendance", classId, date] });

  const markMutation = useMutation({
    mutationFn: (entries) => markAttendance(classId, date, entries),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ attendanceId, payload }) => updateAttendance(attendanceId, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (attendanceId) => deleteAttendance(attendanceId),
    onSuccess: invalidate,
  });

  return { markMutation, updateMutation, deleteMutation };
}

// Real attendance-rate-per-day for the last 5 calendar days, built from actual
// saved records (not synthetic data). A day with no records yet returns rate: null
// so the chart can skip it rather than draw a fake zero.
export function useAttendanceTrend(classId) {
  const dates = lastNDatesISO(5);
  return useQuery({
    queryKey: ["attendance-trend", classId, dates.join(",")],
    enabled: !!classId,
    queryFn: async () => {
      const results = await Promise.all(dates.map((date) => fetchAttendance(classId, date)));
      return results.map((result, i) => {
        const records = result.records;
        if (records.length === 0) return { date: dates[i], rate: null };
        const present = records.filter((r) => r.status === "present" || r.status === "late").length;
        return { date: dates[i], rate: Math.round((present / records.length) * 100) };
      });
    },
  });
}
