import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAttendance, fetchAttendance, markAttendance, updateAttendance } from "../services/attendanceService";

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
