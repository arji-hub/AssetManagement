import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

function Report() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div>Report Page</div>
    </MainLayout>
  );
}

export default Report;
