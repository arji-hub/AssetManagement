import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
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
import { ROLES } from "./data/roles";

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

        {/*routes accessible by any user*/}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/asset" element={<Asset />} />
          <Route path="/qr" element={<QR />} />
          <Route path="/report" element={<Report />} />
          <Route path="/transfer" element={<Transfer />} />

          {/*admin-only routes*/}
          <Route element={<RoleRoute allowed={[ROLES.ADMIN]} />}>
            <Route path="/audit" element={<Audit />} />
            <Route path="/custodian" element={<Custodian />} />
            <Route path="/room" element={<Room />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;