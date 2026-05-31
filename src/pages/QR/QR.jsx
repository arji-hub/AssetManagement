import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

function QR() {
  const { currentUser } = useAuth();

  return (
    <MainLayout>
      <div>QR Page</div>
    </MainLayout>
  );
}

export default QR;
