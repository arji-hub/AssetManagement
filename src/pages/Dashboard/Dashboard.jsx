import React from "react";
import { useAuth } from "../../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import FacultyDashboard from "./FacultyDashboard";

function Dashboard() {
  const { role, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (role === "admin") return <AdminDashboard />;
  if (role === "parttime" || role === "fulltime") return <FacultyDashboard />;

  return <p>No dashboard available for your role.</p>;
}

export default Dashboard;
