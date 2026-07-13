import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchProfile, login as loginRequest } from "../services/authService";

const AuthContext = createContext(null);
const TOKEN_KEY = "attendance_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      setTeacher(profile);
    } catch {
      setToken(null);
      setTeacher(null);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadProfile();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const { access_token } = await loginRequest(email, password);
    localStorage.setItem(TOKEN_KEY, access_token);
    setToken(access_token);
    const profile = await fetchProfile();
    setTeacher(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setTeacher(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, teacher, isLoading, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
