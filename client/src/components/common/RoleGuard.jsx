import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import Loader from "./Loader";

const RoleGuard = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader label="Loading" size="small" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = String(user.role || '').toUpperCase();
  const allowed = Array.isArray(allowedRoles)
    ? allowedRoles.map((r) => String(r || '').toUpperCase())
    : [];

  if (allowed.length && !allowed.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleGuard;
