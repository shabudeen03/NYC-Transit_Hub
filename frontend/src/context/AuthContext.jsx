import { createContext, useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load session
  useEffect(() => {
    api.get("/api/auth/profile")
      .then(res => setUser(res.data))
      .catch(() => {});
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/api/auth/login", { username, password });
    setUser(res.data.user);

    navigate("/");
  };

  const register = async (username, password) => {
    const res = await api.post("/api/auth/register", { username, password });
    setUser(res.data.user);

    navigate("/");
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);

    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
