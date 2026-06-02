import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

function Asset() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div>Asset Page</div>
    </MainLayout>
  );
}

export default Asset;
