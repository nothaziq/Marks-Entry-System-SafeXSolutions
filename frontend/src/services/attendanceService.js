import client from "../api/client";

export async function fetchAttendance(classId, date) {
  const { data } = await client.get("/attendance", { params: { class_id: classId, date } });
  return data.data; // { class_id, date, records: AttendanceResponse[] }
}

// Bulk-create attendance for an entire roster. Only valid the first time
// a given class + date is submitted (backend rejects a second submission).
export async function markAttendance(classId, date, entries) {
  const { data } = await client.post("/attendance", { class_id: classId, date, entries });
  return data.data; // AttendanceResponse[]
}

// Update a single existing record's status/remarks.
export async function updateAttendance(attendanceId, payload) {
  const { data } = await client.put(`/attendance/${attendanceId}`, payload);
  return data.data; // AttendanceResponse
}

export async function deleteAttendance(attendanceId) {
  const { data } = await client.delete(`/attendance/${attendanceId}`);
  return data;
}
