// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";

// 1. Create Context
const AuthContext = createContext();

// 2. Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // store logged-in user
  const [loading, setLoading] = useState(true);

  // Load user strictly from token when app starts (avoid stale local auth)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/auth/profile")
        .then((res) => {
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem("authUser", JSON.stringify(res.data));
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("authUser");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem("authUser");
      setUser(null);
      setLoading(false);
    }
  }, []);

  // signup function (backend)
  const signup = async ({ name, email, password, role, schoolId }) => {
    if (!name || !email || !password || !role || !schoolId) {
      throw new Error("All fields are required");
    }
    const res = await api.post("/auth/register", { name, email, password, role, schoolId });
    const data = res.data;
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    const userData = { _id: data._id, name: data.name, email: data.email, role: data.role, schoolId: data.schoolId };
    setUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData));
    return userData;
  };

  // login function (backend)
  const login = async ({ email, password }) => {
    if (!email || !password) {
      throw new Error("Please provide email and password");
    }
    const res = await api.post("/auth/login", { email, password });
    const data = res.data;
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    const userData = { _id: data._id, name: data.name, email: data.email, role: data.role, schoolId: data.schoolId };
    setUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData));
    return userData;
  };

  // logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook for easy use
export const useAuth = () => useContext(AuthContext);
