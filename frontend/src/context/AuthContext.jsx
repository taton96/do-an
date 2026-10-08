import { createContext, useContext, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("booking_user") || "null"));

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("booking_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const setSession = (data) => {
    if (!data?.token || !data?.user) return;
    localStorage.setItem("token", data.token);
    localStorage.setItem("booking_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem("booking_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("booking_user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, setSession, updateUser, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
