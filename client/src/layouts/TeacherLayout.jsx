// src/layouts/TeacherLayout.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import AdminLayout from "../components/layout/AdminLayout";
import { Users, ClipboardCheck } from "lucide-react";

const TeacherLayout = () => {
  const { isAuthenticated, role, loading } = useAuth();

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

  const teacherSidebarItems = [
    { icon: Users, label: "Students", to: "/teacher/classroom", activePrefixes: ["/teacher/classroom", "/teacher/student"] },
    { icon: ClipboardCheck, label: "Attendance", to: "/teacher/attendance", activePrefixes: ["/teacher/attendance"] },
  ];

  return (
    <AdminLayout sidebarItems={teacherSidebarItems} brandLabel="EduAdmin" showSettings={true} />
  );
};

export default TeacherLayout;
