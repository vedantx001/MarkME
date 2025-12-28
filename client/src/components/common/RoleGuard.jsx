import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const RoleGuard = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  console.log("ROLE GUARD USER:", user);

  if(!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleGuard;
