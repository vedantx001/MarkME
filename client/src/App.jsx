// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

// Teacher Layout & Pages
import TeacherLayout from "./layouts/TeacherLayout";
import Classroom from "./pages/teacher/Classroom";
import Attendance from "./pages/teacher/Attendance";
import StudentDetail from "./pages/teacher/StudentDetail";
import "./App.css";
import PrincipalLayout from "./layouts/PrincipalLayout";
import Dashboard from "./pages/principal/Dashboard";
import Teachers from "./pages/principal/Teachers";
import Classrooms from "./pages/principal/Classrooms";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          {/* Default teacher entry */}
          <Route index element={<Navigate to="classroom" replace />} />

          <Route path="classroom" element={<Classroom />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="student/:id" element={<StudentDetail />} />
        </Route>

        {/* Principal Routes */}
        <Route path="/principal" element={<PrincipalLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="classrooms" element={<Classrooms />} />
          <Route path="classrooms/:classId" element={<Classroom basePath="/principal" />} />
          <Route path="student/:id" element={<StudentDetail />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
