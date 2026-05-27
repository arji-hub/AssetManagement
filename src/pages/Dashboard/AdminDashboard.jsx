import React from "react";
import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
  const { userInfo } = useAuth();

  return (
    <div style={{ padding: "40px" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {userInfo?.firstname} {userInfo?.lastname}</p>
      <p>Role: Admin</p>
    </div>
  );
}

export default AdminDashboard;