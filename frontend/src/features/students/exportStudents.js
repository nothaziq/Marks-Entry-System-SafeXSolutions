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

function rows(students) {
  return students.map((s, i) => ({
    "#": i + 1,
    "Roll Number": s.roll_number,
    "Student Name": s.full_name,
    Class: s.className,
    Section: s.classSection || "",
  }));
}

export function exportStudentsCSV(students) {
  if (students.length === 0) return;
  const data = rows(students);
  const header = Object.keys(data[0]);
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header, ...data.map((r) => header.map((h) => r[h]))].map((row) => row.map(escape).join(",")).join("\n");
  downloadBlob(`students_${new Date().toISOString().slice(0, 10)}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8;" }));
}

// Loaded on demand so the xlsx library doesn't bloat the main bundle for
// people who never click this button.
export async function exportStudentsExcel(students) {
  if (students.length === 0) return;
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet(rows(students));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Students");
  XLSX.writeFile(workbook, `students_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
