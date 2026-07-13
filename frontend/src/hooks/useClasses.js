import { useQuery } from "@tanstack/react-query";
import { fetchClassRoster, fetchMyClasses } from "../services/classService";

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: fetchMyClasses,
  });
}

export function useClassRoster(classId) {
  return useQuery({
    queryKey: ["roster", classId],
    queryFn: () => fetchClassRoster(classId),
    enabled: !!classId,
  });
}
