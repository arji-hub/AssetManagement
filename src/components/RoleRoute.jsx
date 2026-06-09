import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./ui/status/LoadingScreen";

function RoleRoute({ allowed }) {
  const { role, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!allowed.includes(role)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export default RoleRoute;
