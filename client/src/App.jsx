import { Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClassroomProvider } from "./context/ClassroomContext";
import AuthPage from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import ClassroomPage from "./pages/ClassroomPage";
import PrincipalClassroomView from "./pages/PrincipalClassroomView"; // 👈 1. Import the new page
import Landing from "./pages/LandingPage";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ClassroomProvider>
        <Routes>
          {/* <Route path="/" element={<Landing />} /> */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <PrivateRoute allowedRoles={["teacher"]}>
                <TeacherDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/:classId"
            element={
              <PrivateRoute allowedRoles={["teacher"]}>
                <ClassroomPage />
              </PrivateRoute>
            }
          />

          {/* Principal Routes */}
          <Route
            path="/principal"
            element={
              <PrivateRoute allowedRoles={["principal"]}>
                <PrincipalDashboard />
              </PrivateRoute>
            }
          />
          {/* 👇 2. Add the new route for the principal's view */}
          <Route
            path="/principal/:classId"
            element={
              <PrivateRoute allowedRoles={["principal"]}>
                <PrincipalClassroomView />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </ClassroomProvider>
    </AuthProvider>
  );
}

export default App;