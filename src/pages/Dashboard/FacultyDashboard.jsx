import React from "react";
import { useAuth } from "../../context/AuthContext";

function FacultyDashboard() {
  const { userInfo } = useAuth();

  return (
    <div style={{ padding: "40px" }}>
      <h1>Faculty Dashboard</h1>
      <p>
        Welcome, {userInfo?.firstname} {userInfo?.lastname}
      </p>
      <p>Role: {userInfo?.role}</p>
    </div>
  );
}

export default FacultyDashboard;
