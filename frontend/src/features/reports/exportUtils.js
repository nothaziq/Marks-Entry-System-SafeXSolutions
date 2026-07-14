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

function summaryRows(perClass) {
  return perClass.map((c, i) => ({
    "#": i + 1,
    Course: c.name,
    Section: c.section || "",
    Students: c.studentCount,
    "Avg Attendance %": c.rate ?? "",
    Present: c.counts.present,
    Absent: c.counts.absent,
    Late: c.counts.late,
    Leave: c.counts.leave,
  }));
}

export function exportReportCSV(perClass, meta) {
  const rows = summaryRows(perClass);
  const header = Object.keys(rows[0] || { "#": "", Course: "" });
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header, ...rows.map((r) => header.map((h) => r[h]))].map((row) => row.map(escape).join(",")).join("\n");
  downloadBlob(`attendance-report_${meta.from}_to_${meta.to}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8;" }));
}

// Loaded on demand so the xlsx library doesn't bloat the main bundle for
// people who never click this button.
export async function exportReportExcel(perClass, meta) {
  const XLSX = await import("xlsx");
  const rows = summaryRows(perClass);
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Attendance Summary");
  XLSX.writeFile(workbook, `attendance-report_${meta.from}_to_${meta.to}.xlsx`);
}

// No PDF library is bundled — this uses the browser's native print dialog
// ("Save as PDF" is a print destination in every modern browser), scoped to
// the report content via the #print-report / @media print rules in
// index.css. That keeps this a real, working export with zero added weight.
export function exportReportPDF() {
  window.print();
}
