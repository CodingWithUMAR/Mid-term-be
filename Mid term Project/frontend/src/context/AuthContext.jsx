import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await api("/auth/me");
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const result = await api("/auth/login", { method: "POST", body: credentials });
    await refreshUser();
    return result;
  };
  const logout = async () => {
    try { await api("/auth/logout", { method: "POST", body: {} }); }
    finally { setUser(null); }
  };

  const value = useMemo(() => ({ user, loading, login, logout, refreshUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
