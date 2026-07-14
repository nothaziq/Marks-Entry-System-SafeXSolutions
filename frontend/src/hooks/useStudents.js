import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchMyClasses, fetchClassRoster } from "../services/classService";

// There's no dedicated "all students" endpoint on the backend — a student
// only exists in the API scoped to a class (`GET /classes/{id}/students`).
// So, same pattern as useDashboard/useReports: fetch every class the teacher
// owns, fetch each class's roster, and flatten them into one real list.
// Nothing here is synthesized — no status, email, or gender fields are
// invented, because the Student model on the backend doesn't have them.
export function useStudents() {
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

  const isLoading = classesQuery.isLoading || rosterQueries.some((q) => q.isLoading);
  const isError = classesQuery.isError || rosterQueries.some((q) => q.isError);
  const error = classesQuery.error || rosterQueries.find((q) => q.isError)?.error;

  const rosterKey = rosterQueries.map((q) => q.dataUpdatedAt).join(",");

  const classesWithRoster = useMemo(
    () =>
      classes.map((cls, i) => ({
        ...cls,
        label: cls.section ? `${cls.name} - Section ${cls.section}` : cls.name,
        roster: rosterQueries[i]?.data ?? [],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classes, rosterKey]
  );

  const students = useMemo(
    () =>
      classesWithRoster.flatMap((cls) =>
        cls.roster.map((s) => ({
          ...s,
          className: cls.name,
          classSection: cls.section,
          classLabel: cls.label,
        }))
      ),
    [classesWithRoster]
  );

  const classBreakdown = useMemo(
    () =>
      classesWithRoster
        .map((cls) => ({ id: cls.id, label: cls.label, count: cls.roster.length }))
        .filter((c) => c.count > 0),
    [classesWithRoster]
  );

  const totalStudents = students.length;
  const totalClasses = classes.length;
  const avgClassSize = totalClasses === 0 ? 0 : Math.round(totalStudents / totalClasses);
  const largestClass = classBreakdown.reduce(
    (max, c) => (c.count > (max?.count ?? -1) ? c : max),
    null
  );

  return {
    classes: classesWithRoster,
    students,
    classBreakdown,
    isLoading,
    isError,
    error,
    totalStudents,
    totalClasses,
    avgClassSize,
    largestClass,
  };
}
