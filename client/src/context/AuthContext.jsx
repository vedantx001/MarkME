// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

// 1. Create Context
const AuthContext = createContext();

// 2. Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // store logged-in user
  const [loading, setLoading] = useState(true);

  // Load user from localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Helpers to manage the local "users" store (mock backend)
  const getStoredUsers = () => {
    try {
      const raw = localStorage.getItem("authUsers");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const setStoredUsers = (users) => {
    localStorage.setItem("authUsers", JSON.stringify(users));
  };

  // signup function (mock): persists user in localStorage and prevents duplicates
  const signup = async ({ name, email, password, role }) => {
    if (!name || !email || !password || !role) {
      throw new Error("All fields are required");
    }

    const users = getStoredUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );
    if (exists) {
      throw new Error("An account with this email already exists");
    }

    const newUser = {
      id: crypto?.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name,
      email,
      password, // Note: in real apps never store plain passwords
      role,
    };
    users.push(newUser);
    setStoredUsers(users);
    return { id: newUser.id, name, email, role };
  };

  // login function (mock): validates credentials against stored users
  const login = async ({ email, password, role }) => {
    if (!email || !password || !role) {
      throw new Error("Please provide email, password, and role");
    }

    const users = getStoredUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );
    if (!found) {
      throw new Error("No account found for this email");
    }
    if (found.password !== password) {
      throw new Error("Incorrect password");
    }
    if (found.role !== role) {
      throw new Error("Selected role does not match account role");
    }

    const userData = { id: found.id, name: found.name, email: found.email, role: found.role };
    setUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData));
    return userData;
  };

  // logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook for easy use
export const useAuth = () => useContext(AuthContext);
