import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

function Room() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div>Room Page</div>
    </MainLayout>
  );
}

export default Room;
