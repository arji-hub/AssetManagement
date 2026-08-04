import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

import LoginModal from "../../components/ui/modal/LoginModal";
import QRModal from "../../components/ui/modal/QRModal";
import QRInfo from "../../components/ui/modal/QRInfo";
import QRStatusModal from "../../components/ui/status/QRStatusModal";
import { useQRScanner } from "../../hooks/camera/useQRScanner";

import elib from "../../assets/image/elib.png";
import bulsuGate from "../../assets/image/bulsuGate.png";
import CICTLOGO from "../../assets/logo/CICTLOGO.png";

import "./LoginPage.css";

function LoginPage({ previewAsset, assetNotFound }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAssetPreview = previewAsset !== undefined;

  const [mode, setMode] = useState(
    searchParams.get("view") === "qr" ? "scan" : "login",
  );

  const { status, errorMessage, handleImageUpload, handleScan, reset } =
    useQRScanner();

  return (
    <div className="login-page">
      {/* ============ PANE A ============ */}
      <div className="login-page__pane login-page__pane--form">
        <Link to="/" className="login-page__brand" aria-label="Back to home">
          <img src={CICTLOGO} alt="CICT Logo" className="login-page__logo" />
          <span className="login-page__wordmark">CICT Asset Management</span>
        </Link>

        <div
          key={`form-${mode}-${isAssetPreview}`}
          className="login-page__pane-content"
        >
          {isAssetPreview ? (
            <QRInfo asset={previewAsset} />
          ) : mode === "login" ? (
            <LoginModal />
          ) : (
            <QRModal onScan={handleScan} onImageUpload={handleImageUpload} />
          )}
        </div>
      </div>

      {/* ============ PANE B ============ */}
      <div
        className="login-page__pane login-page__pane--semantic"
        style={{
          backgroundImage: `url(${mode === "login" ? bulsuGate : elib})`,
        }}
      >
        <div className="login-page__semantic-overlay" />

        <div
          key={`semantic-${mode}-${isAssetPreview}`}
          className="login-page__pane-content login-page__semantic-content"
        >
          {isAssetPreview ? (
            <>
              <span className="login-page__eyebrow">Staff Access</span>
              <h2 className="login-page__heading">
                Sign in for the full picture.
              </h2>
              <p className="login-page__body">
                This is a public preview. Sign in to see custodian history,
                condition reports, and manage this asset directly.
              </p>
              <button
                className="login-page__cta"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </>
          ) : mode === "login" ? (
            <>
              <span className="login-page__eyebrow">Asset Lookup</span>
              <h2 className="login-page__heading">
                Point, scan, know exactly what it is.
              </h2>
              <p className="login-page__body">
                Every asset on campus carries a CICT QR tag. Scan it to pull up
                its history, custodian, and condition — no account needed.
              </p>
              <button
                className="login-page__cta"
                onClick={() => setMode("scan")}
              >
                Scan Asset
              </button>
            </>
          ) : (
            <>
              <span className="login-page__eyebrow">Staff Access</span>
              <h2 className="login-page__heading">
                Manage the assets you're responsible for.
              </h2>
              <p className="login-page__body">
                Sign in to log transfers, file condition reports, and run room
                audits across your assigned units.
              </p>
              <button
                className="login-page__cta"
                onClick={() => setMode("login")}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>

      {status && (
        <QRStatusModal
          status={status}
          errorMessage={errorMessage}
          onClose={reset}
        />
      )}
    </div>
  );
}

export default LoginPage;
