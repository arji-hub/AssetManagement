import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/ui/LoadingScreen";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Asset from "./pages/Asset/Asset";
import Custodian from "./pages/Custodian/Custodian";
import Report from "./pages/Report/Report";
import Transfer from "./pages/Transfer/Transfer";
import QR from "./pages/QR/QR";
import Audit from "./pages/Audit/Audit";
import Room from "./pages/Room/Room";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/asset" element={<Asset />} />
          <Route path="/custodian" element={<Custodian />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/report" element={<Report />} />
          <Route path="/qr" element={<QR />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/room" element={<Room />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
