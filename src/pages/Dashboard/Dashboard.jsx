import React from "react";
import { useAuth } from "../../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import FacultyDashboard from "./FacultyDashboard";
import { ROLES } from "../../data/roles";

function Dashboard() {
  const { role, loading, user, userInfo } = useAuth();

  // add these logs
  console.log("loading:", loading);
  console.log("user:", user);
  console.log("role:", role);
  console.log("userInfo:", userInfo);
  if (loading) return <p>Loading...</p>;

  if (role === ROLES.ADMIN) return <AdminDashboard />;

  if (role === ROLES.PARTTIME || role === ROLES.FULLTIME)
    return <FacultyDashboard />;

  return <p>Something went wrong.</p>;
}

export default Dashboard;
