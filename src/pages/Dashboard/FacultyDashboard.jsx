import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

function FacultyDashboard() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div style={{ padding: "40px" }}>
        <h1>Faculty Dashboard</h1>
        <p>
          Welcome, {user?.firstname} {user?.lastname}
        </p>
        <p>Role: {user?.role}</p>
      </div>
    </MainLayout>
  );
}

export default FacultyDashboard;
