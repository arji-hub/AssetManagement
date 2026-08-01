import React, { useState } from "react";
import { login } from "../../services/authService";
import LoginModal from "../../components/ui/modal/LoginModal";
import QRModal from "../../components/ui/modal/QRModal";
import QRInfo from "../../components/ui/modal/QRInfo";
import logo from "../../assets/CICTLOGO.png";
import elib from "../../assets/elib.png";
import { useQRScanner } from "../../hooks/camera/useQRScanner";
import QRStatusModal from "../../components/ui/status/QRStatusModal";
import "./LandingPage.css";

function LandingPage({ previewAsset, assetNotFound }) {
  const [view, setView] = useState("qr");

  const { status, errorMessage, handleImageUpload, handleScan, reset } =
    useQRScanner();

  const toggleView = () => {
    setView((prev) => (prev === "qr" ? "login" : "qr"));
  };
  console.log(view);

  return (
    <div className="login-page">
      {/* Background */}
      <div className="login-bg" style={{ backgroundImage: `url(${elib})` }} />

      {/* Top bar */}
      <div className="login-topbar">
        <div className="login-topbar-left">
          <img src={logo} alt="CICT Logo" className="login-topbar-logo" />
          <span className="login-topbar-title">Asset Management System</span>
        </div>
        <button className="login-scan-btn" onClick={toggleView}>
          {view === "qr" ? "Login" : "Scan QR"}
        </button>
      </div>

      {/* Modal floats over the background */}
      <div className="login-main">
        {view === "qr" ? (
          previewAsset !== undefined ? (
            <QRInfo asset={previewAsset} />
          ) : (
            <QRModal onScan={handleScan} onImageUpload={handleImageUpload} />
          )
        ) : (
          <LoginModal />
        )}
        {status && (
          <QRStatusModal
            status={status}
            errorMessage={errorMessage}
            onClose={reset}
          />
        )}
      </div>
    </div>
  );
}

export default LandingPage;
