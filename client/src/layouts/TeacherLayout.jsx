// src/layouts/TeacherLayout.jsx
import { Outlet, Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import { useAuth } from "../context/authContext";

const TeacherLayout = () => {
  const { isAuthenticated, role, loading } = useAuth();

  // Sidebar visibility state
  // Default to open on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loading) {
    return (
      <div className="min-h-screen bg-(--secondary-bg) flex items-center justify-center">
        <div className="text-(--primary-text)/60 text-sm font-inter">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated || String(role || "").toUpperCase() !== "TEACHER") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-(--secondary-bg) font-inter">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-(--secondary-bg) p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
