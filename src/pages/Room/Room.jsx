import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

function Room() {
  const { currentUser } = useAuth();

  return (
    <MainLayout>
      <div>Room Page</div>
    </MainLayout>
  );
}

export default Room;
