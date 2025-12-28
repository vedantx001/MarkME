// src/layouts/PrincipalLayout.jsx

import { Outlet, Navigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const PrincipalLayout = () => {
  // FRONTEND-ONLY (mock auth)
  const isAuthenticated = true;
  const userRole = "principal";

  // Sidebar visibility state
  // Default to open on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!isAuthenticated || userRole !== "principal") {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen bg-(--secondary-bg) font-inter">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        role="principal"
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto bg-(--secondary-bg) p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PrincipalLayout;
