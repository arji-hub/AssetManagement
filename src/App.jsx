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
import TransferInfo from "./pages/Transfer/TransferInfo";
import TransferRoom from "./pages/Transfer/TransferRoom";
import QR from "./pages/QR/QR";
import Audit from "./pages/Audit/Audit";
import AuditRoom from "./pages/Audit/AuditRoom";
import Room from "./pages/Room/Room";
import { ROLES } from "./data/roles";
import CustodianAssets from "./pages/Custodian/CustodianAssets";
import RoomAssets from "./pages/Room/RoomAssets";
import Profile from "./pages/Profile/Profile";
import ReportInfo from "./pages/Report/ReportInfo";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* LANDING PAGE */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <LandingPage />}
        />

        {/* QR redirects here */}
        <Route path="/asset/:assetId" element={<AssetPreview />} />

        {/* LOGGED IN USER PAGES */}
        <Route element={<ProtectedRoute />}>
          {/* PROFILE PAGE */}
          <Route path="/profile" element={<Profile />} />

          {/* DASHBOARD PAGE */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ASSET PAGE */}
          <Route path="/asset">
            <Route index element={<Asset />} />
            <Route path="registration" element={<AssetRegistration />} />
            <Route path="info/:assetId" element={<AssetInfo />} />
          </Route>

          {/* QR PAGE */}
          <Route path="/qr" element={<QR />} />

          {/* REPORT PAGE */}
          <Route path="/report">
            <Route index element={<Report />} />
            <Route path=":id" element={<ReportInfo />} />
          </Route>

          {/* TRANSFER PAGE */}
          <Route path="/transfer">
            <Route index element={<Transfer />} />
            <Route element={<RoleRoute allowed={[ROLES.ADMIN]} />}>
              <Route path="room" element={<TransferRoom />} />
            </Route>
            <Route path=":id" element={<TransferInfo />} />
          </Route>

          {/* ADMIN ONLY PAGES */}
          <Route element={<RoleRoute allowed={[ROLES.ADMIN]} />}>
            {/* AUDIT PAGE */}
            <Route path="/audit">
              <Route index element={<Audit />} />
              <Route path="room" element={<AuditRoom />} />
            </Route>

            {/* CUSTODIAN PAGE */}
            <Route path="/custodian">
              <Route index element={<Custodian />} />
              <Route path=":username" element={<CustodianAssets />} />
            </Route>

            {/* ROOM PAGE */}
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
