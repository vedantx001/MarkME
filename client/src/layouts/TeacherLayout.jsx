// src/layouts/TeacherLayout.jsx
import { Outlet, Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

const TeacherLayout = () => {
  // FRONTEND-ONLY (mock auth)
  const isAuthenticated = true;
  const userRole = "teacher";

  // Sidebar visibility state
  // Default to open on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!isAuthenticated || userRole !== "teacher") {
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
