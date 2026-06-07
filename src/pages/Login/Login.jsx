import React from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import LoginModal from "../../components/ui/modal/LoginModal";
import logo from "../../assets/CICTLOGO.png";
import elib from "../../assets/elib.png";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    const { role } = await login(email, password);

    if (role === "admin" || role === "parttime" || role === "fulltime") {
      navigate("/dashboard");
    } else {
      throw new Error("No role assigned.");
    }
  };

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
        <button className="login-scan-btn">Scan QR</button>
      </div>

      {/* Modal floats over the background */}
      <div className="login-main">
        <LoginModal onLogin={handleLogin} />
      </div>
    </div>
  );
}

export default Login;
