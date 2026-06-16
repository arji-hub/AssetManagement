import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/route/ProtectedRoute";
import RoleRoute from "./components/route/RoleRoute";
import LoadingScreen from "./components/ui/status/LoadingScreen";
import LandingPage from "./pages/LandingPage/LandingPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Asset from "./pages/Asset/Asset";
import AssetRegistration from "./pages/Asset/AssetRegistration";
import AssetInfo from "./pages/Asset/AssetInfo";
import AssetPreview from "./pages/QR/AssetPreview";
import Custodian from "./pages/Custodian/Custodian";
import Report from "./pages/Report/Report";
import Transfer from "./pages/Transfer/Transfer";
import QR from "./pages/QR/QR";
import Audit from "./pages/Audit/Audit";
import Room from "./pages/Room/Room";
import { ROLES } from "./data/roles";
import CustodianAssets from "./pages/Custodian/CustodianAssets";
import RoomAssets from "./pages/Room/RoomAssets";

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
          element={user ? <Navigate to="/dashboard" /> : <LandingPage />}
        />

        {/* QR redirects here */}
        <Route path="/asset/:assetId" element={<AssetPreview />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/asset">
            <Route index element={<Asset />} />
            <Route path="registration" element={<AssetRegistration />} />
            <Route path="info/:assetId" element={<AssetInfo />} />
          </Route>
          <Route path="/qr" element={<QR />} />
          <Route path="/report" element={<Report />} />
          <Route path="/transfer" element={<Transfer />} />

          <Route element={<RoleRoute allowed={[ROLES.ADMIN]} />}>
            <Route path="/audit" element={<Audit />} />
            <Route path="/custodian">
              <Route index element={<Custodian />} />
              <Route path=":username" element={<CustodianAssets />} />
            </Route>
            <Route path="/room">
              <Route index element={<Room />} />
              <Route path=":roomName" element={<RoomAssets />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
