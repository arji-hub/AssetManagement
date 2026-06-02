import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

function Audit() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div>Audit Page</div>
    </MainLayout>
  );
}

export default Audit;
