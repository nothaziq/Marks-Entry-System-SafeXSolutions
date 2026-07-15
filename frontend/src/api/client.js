import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every outgoing request, if we have one.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("attendance_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors to the backend's { success, message, errors } envelope,
// and force a logout if the token is rejected/expired.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const body = error.response?.data;

    if (status === 401) {
      localStorage.removeItem("attendance_token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    const message = body?.message || error.message || "Something went wrong. Please try again.";
    const errors = body?.errors || [];
    return Promise.reject({ status, message, errors });
  }
);

export default client;
