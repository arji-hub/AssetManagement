import LoginModal from "../../components/ui/modal/LoginModal";
import { Link } from "react-router-dom";

import bulsuGate from "../../assets/image/bulsuGate.png";
import pimentel from "../../assets/image/pimentel.png";
import CICTLOGO from "../../assets/logo/CICTLOGO.png";

import "./LoginPage.css";

function LoginPage() {
  return (
    <div className="login-page">
      {/* ============ PANE A ============ */}
      <div className="login-page__pane login-page__pane--form">
        <Link to="/" className="login-page__brand" aria-label="Back to home">
          <img src={CICTLOGO} alt="CICT Logo" className="login-page__logo" />
          <span className="login-page__wordmark">CICT Asset Management</span>
        </Link>

        <div className="login-page__pane-content">
          <LoginModal />
        </div>
      </div>

      {/* ============ PANE B ============ */}
      <div
        className="login-page__pane login-page__pane--semantic"
        style={{ backgroundImage: `url(${pimentel})` }}
      >
        <div className="login-page__semantic-overlay" />

        <div className="login-page__pane-content login-page__semantic-content">
          <span className="login-page__eyebrow">Staff Access</span>
          <h2 className="login-page__heading">
            Manage the assets you're responsible for.
          </h2>
          <p className="login-page__body">
            Sign in to log transfers, file condition reports, and run room
            audits across your assigned units.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
