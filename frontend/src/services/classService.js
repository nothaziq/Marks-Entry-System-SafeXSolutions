import client from "../api/client";

export async function fetchMyClasses() {
  const { data } = await client.get("/teacher/classes");
  return data.data; // ClassResponse[]
}

export async function fetchClassRoster(classId) {
  const { data } = await client.get(`/classes/${classId}/students`);
  return data.data; // StudentResponse[]
}
