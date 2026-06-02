import React from "react";
import { useAuth } from "../../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import FacultyDashboard from "./FacultyDashboard";
import { ROLES } from "../../data/roles";
import LoadingScreen from "../../components/ui/LoadingScreen";

function Dashboard() {
  const { role, loading } = useAuth();

  console.log("userInfo:", userInfo);
  if (loading) return <LoadingScreen />;

  if (role === ROLES.ADMIN) return <AdminDashboard />;

  if (role === ROLES.PARTTIME || role === ROLES.FULLTIME)
    return <FacultyDashboard />;

  return <p>Something went wrong.</p>;
}

export default Dashboard;
