import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

function Transfer() {
  const { currentUser } = useAuth();

  return (
    <MainLayout>
      <div>Transfer Page</div>
    </MainLayout>
  );
}

export default Transfer;
