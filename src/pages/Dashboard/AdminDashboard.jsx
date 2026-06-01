import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

function AdminDashboard() {
  const { userInfo } = useAuth();

  return (
    <MainLayout>
      <div style={{ padding: "40px" }}>
        <h1>Admin Dashboard</h1>
        <p>
          Welcome, {userInfo?.firstname} {userInfo?.lastname}
        </p>
        <p>Role: Admin</p>
      </div>
    </MainLayout>
  );
}

export default AdminDashboard;
