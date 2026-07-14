import { fetchClassRoster, fetchMyClasses } from "../../services/classService";
import { fetchAttendance } from "../../services/attendanceService";
import { datesBetween } from "../../utils/date";
import { STATUS_LABEL } from "../../utils/constants";

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Pulls every saved attendance record in the given date range, across the
// given classes (or all of the teacher's classes if classIds is empty).
// One request per class per day against the real API — same pattern as
// useReports/useDashboard. Nothing here is synthesized; a day with no saved
// records for a class just contributes no rows.
async function collectAttendanceRows(from, to, classIds = []) {
  const allClasses = await fetchMyClasses();
  const classes = classIds.length > 0 ? allClasses.filter((c) => classIds.includes(c.id)) : allClasses;
  const dates = datesBetween(from, to);

  const rosters = await Promise.all(classes.map((c) => fetchClassRoster(c.id)));

  const perDay = await Promise.all(
    classes.flatMap((cls, i) =>
      dates.map((date) => fetchAttendance(cls.id, date).then((res) => ({ cls, roster: rosters[i], date, records: res.records })))
    )
  );

  const rows = [];
  perDay
    .sort((a, b) => a.date.localeCompare(b.date) || a.cls.name.localeCompare(b.cls.name))
    .forEach(({ cls, roster, date, records }) => {
      const rosterById = new Map(roster.map((s) => [s.id, s]));
      records.forEach((r) => {
        const student = rosterById.get(r.student_id);
        rows.push({
          Date: date,
          Course: cls.name,
          Section: cls.section || "",
          "Roll Number": student?.roll_number || "",
          "Student Name": student?.full_name || "",
          Status: STATUS_LABEL[r.status] || r.status,
          Remarks: r.remarks || "",
        });
      });
    });
  return rows;
}

export async function exportAttendanceCSV(from, to, classIds = []) {
  const rows = await collectAttendanceRows(from, to, classIds);
  if (rows.length === 0) return { count: 0 };
  const header = Object.keys(rows[0]);
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header, ...rows.map((r) => header.map((h) => r[h]))].map((row) => row.map(escape).join(",")).join("\n");
  downloadBlob(`attendance-export_${from}_to_${to}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  return { count: rows.length };
}

// Loaded on demand so the xlsx library doesn't bloat the main bundle for
// people who never click this button.
export async function exportAttendanceExcel(from, to, classIds = []) {
  const rows = await collectAttendanceRows(from, to, classIds);
  if (rows.length === 0) return { count: 0 };
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = [{ wch: 12 }, { wch: 22 }, { wch: 10 }, { wch: 12 }, { wch: 24 }, { wch: 10 }, { wch: 28 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Attendance");
  XLSX.writeFile(workbook, `attendance-export_${from}_to_${to}.xlsx`);
  return { count: rows.length };
}
