// src/layouts/PrincipalLayout.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import AdminLayout from "../components/layout/AdminLayout";
import { LayoutDashboard, Users, School } from "lucide-react";

const PrincipalLayout = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-(--secondary-bg) flex items-center justify-center">
        <div className="text-(--primary-text)/60 text-sm font-inter">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated || String(role || "").toUpperCase() !== "PRINCIPAL") {
    return <Navigate to="/login" replace />;
  }

  const principalSidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/principal/dashboard", activePrefixes: ["/principal/dashboard"] },
    { icon: Users, label: "Teachers", to: "/principal/teachers", activePrefixes: ["/principal/teachers"] },
    { icon: School, label: "Classrooms", to: "/principal/classrooms", activePrefixes: ["/principal/classrooms", "/principal/student"] },
  ];

  // Reuse admin panel chrome (navbar/sidebar/sign-out) for principal.
  return <AdminLayout sidebarItems={principalSidebarItems} brandLabel="EduAdmin" showSettings={false} />;
};

export default PrincipalLayout;
