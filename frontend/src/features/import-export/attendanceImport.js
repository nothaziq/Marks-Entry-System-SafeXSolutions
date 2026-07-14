import { STATUS_OPTIONS } from "../../utils/constants";

const STATUS_BY_ALIAS = (() => {
  const map = {};
  STATUS_OPTIONS.forEach(({ value, label }) => {
    map[value] = value;
    map[label.toLowerCase()] = value;
  });
  map.p = "present";
  map.a = "absent";
  map.l = "late";
  map.lv = "leave";
  return map;
})();

// Case/whitespace-insensitive; accepts the status value, its label, or a
// couple of common shorthands. Returns null if it doesn't recognize it.
export function normalizeStatus(raw) {
  if (raw === null || raw === undefined) return null;
  const key = String(raw).trim().toLowerCase();
  return STATUS_BY_ALIAS[key] || null;
}

function pick(row, candidates) {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const match = keys.find((k) => k.trim().toLowerCase() === candidate);
    if (match) return row[match];
  }
  return "";
}

// Parses an uploaded .xlsx/.xls/.csv file into raw rows. Column headers are
// matched case-insensitively against a few common spellings, so it accepts
// files exported by this app as well as reasonably-formatted manual ones.
export async function parseAttendanceFile(file) {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  return json
    .map((row, i) => ({
      line: i + 2, // header row + 1-index
      rollNumber: String(pick(row, ["roll number", "roll no", "roll no.", "roll", "rollnumber"])).trim(),
      statusRaw: String(pick(row, ["status"])).trim(),
      remarks: String(pick(row, ["remarks", "notes", "remark"])).trim(),
    }))
    .filter((r) => r.rollNumber || r.statusRaw);
}

// A blank fill-in-the-blanks template for one class/date, pre-populated with
// the real roster so the roll numbers always line up on re-upload.
export async function downloadAttendanceTemplate(roster, className, date) {
  const XLSX = await import("xlsx");
  const rows = [...roster]
    .sort((a, b) => a.roll_number.localeCompare(b.roll_number, undefined, { numeric: true }))
    .map((s) => ({ "Roll Number": s.roll_number, "Student Name": s.full_name, Status: "", Remarks: "" }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = [{ wch: 14 }, { wch: 24 }, { wch: 12 }, { wch: 26 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Attendance");
  const safeClass = (className || "class").replace(/\s+/g, "-").toLowerCase();
  XLSX.writeFile(workbook, `attendance-template_${safeClass}_${date}.xlsx`);
}
