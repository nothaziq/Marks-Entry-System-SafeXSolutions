import client from "../api/client";

export async function fetchNotificationPreferences() {
  const { data } = await client.get("/notification-preferences");
  return data.data; // { reminders_enabled }
}

export async function updateNotificationPreferences({ reminders_enabled }) {
  const { data } = await client.put("/notification-preferences", { reminders_enabled });
  return data.data; // { reminders_enabled }
}
