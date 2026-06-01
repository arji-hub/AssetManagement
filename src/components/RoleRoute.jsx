import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({ allowed }) {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!allowed.includes(role)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export default RoleRoute;