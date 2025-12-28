import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "../pages/LandingPage";

// Auth
import Login from "../pages/auth/Login";
import RegisterAdmin from "../pages/auth/RegisterAdmin";

// Teacher
import TeacherLayout from "../layouts/TeacherLayout";
import TeacherClassroom from "../pages/teacher/Classroom";
import TeacherAttendance from "../pages/teacher/Attendance";
import TeacherStudentDetail from "../pages/teacher/StudentDetail";

// Principal
import PrincipalLayout from "../layouts/PrincipalLayout";
import PrincipalDashboard from "../pages/principal/Dashboard";
import PrincipalTeachers from "../pages/principal/Teachers";
import PrincipalClassrooms from "../pages/principal/Classrooms";

// Admin
import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleGuard from "../components/common/RoleGuard";
import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminTeachers from "../pages/admin/Teachers";
import AdminClassroom from "../pages/admin/Classroom";
import AdminPrincipal from "../pages/admin/Principal";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        {/* Backward compatibility */}
        <Route path="/auth" element={<Navigate to="/login" replace />} />

        {/* Teacher (Protected) */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["TEACHER"]}>
                <TeacherLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="classroom" replace />} />
          <Route path="classroom" element={<TeacherClassroom />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="student/:id" element={<TeacherStudentDetail />} />
        </Route>

        {/* Principal (Protected) */}
        <Route
          path="/principal"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["PRINCIPAL"]}>
                <PrincipalLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PrincipalDashboard />} />
          <Route path="teachers" element={<PrincipalTeachers />} />
          <Route path="classrooms" element={<PrincipalClassrooms />} />
          <Route
            path="classrooms/:classId"
            element={<TeacherClassroom basePath="/principal" />}
          />
          <Route path="student/:id" element={<TeacherStudentDetail />} />
        </Route>

        {/* Admin (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="teachers" element={<AdminTeachers />} />
          <Route path="classrooms" element={<AdminClassroom />} />
          <Route path="principal" element={<AdminPrincipal />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
