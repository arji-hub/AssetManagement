import React from "react";
import logo from "../../../assets/CICTLOGO.png";
import elib from "../../../assets/elib.png";
import "./LoadingScreen.css";

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-bg" style={{ backgroundImage: `url(${elib})` }} />

      <div className="loading-content">
        <img src={logo} alt="CICT Logo" className="loading-logo" />

        <div className="loading-titles">
          <div className="loading-app-name">Asset Management System</div>
          <div className="loading-college-name">
            College of Information and Communications Technology
          </div>
        </div>

        <div className="loading-spinner" />

        <div className="loading-text">Please wait...</div>
      </div>
    </div>
  );
}

export default LoadingScreen;
