import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

function Faculty() {
  const { currentUser } = useAuth();

  return (
    <MainLayout>
      <div>Faculty Page</div>
    </MainLayout>
  );
}

export default Faculty;
