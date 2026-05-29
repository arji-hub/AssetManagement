import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

function FacultyDashboard() {
  const { userInfo } = useAuth();

  return (
    <MainLayout>
      <div style={{ padding: "40px" }}>
        <h1>Faculty Dashboard</h1>
        <p>
          Welcome, {userInfo?.firstname} {userInfo?.lastname}
        </p>
        <p>Role: {userInfo?.role}</p>
      </div>
    </MainLayout>
  );
}

export default FacultyDashboard;
