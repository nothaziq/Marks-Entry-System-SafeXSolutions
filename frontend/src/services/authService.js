import client from "../api/client";

export async function login(email, password) {
  const { data } = await client.post("/login", { email, password });
  return data.data; // { access_token, token_type }
}

export async function fetchProfile() {
  const { data } = await client.get("/profile");
  return data.data; // { id, full_name, email, is_admin, is_active, created_at }
}

export async function changePassword({ current_password, new_password, confirm_password }) {
  const { data } = await client.post("/change-password", {
    current_password,
    new_password,
    confirm_password,
  });
  return data.message;
}
