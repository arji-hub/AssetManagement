import bulsuGate from "../../assets/image/bulsuGate.png";
import pimentel from "../../assets/image/pimentel.png";
import elib from "../../assets/image/elib.png";
import alabBulsu from "../../assets/image/alabBulsu.jpg";
import CICTLOGO from "../../assets/logo/CICTLOGO.png";
import BULSULOGO from "../../assets/logo/BULSULOGO.png";

import QRModal from "../../components/modal/QRModal";
import QRInfo from "../../components/modal/QRInfo";
import QRStatusModal from "../../components/ui/status/QRStatusModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import { useQRScanner } from "../../hooks/camera/useQRScanner";

import "./Body.css";

function Body({ sectionRefs, previewAsset }) {
  const { hero: heroRef, campus: campusRef, qr: qrRef } = sectionRefs;

  const { status, errorMessage, handleImageUpload, handleScan, reset } =
    useQRScanner();

  const isAssetPreview = previewAsset !== undefined;

  const handleScanClick = () => {
    qrRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="body">
      {/* ================= HERO ================= */}
      <section ref={heroRef} className="hero-section">
        <div className="hero-background">
          <img src={bulsuGate} alt="Bulacan State University" />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-logo">
            <img src={CICTLOGO} alt="CICT Logo" className="cict-logo" />
            <img src={BULSULOGO} alt="BULSU Logo" className="bulsu-logo" />
          </div>
          <h1>Asset Management System</h1>
          <p>"Every asset accounted for, every byte in its place."</p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={handleScanClick}>
              <FontAwesomeIcon icon={faQrcode} />
              <span>Scan Asset QR Code</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= QR SCAN + GUIDE ================= */}
      <section ref={qrRef} className="qr-section">
        <div className="qr-section__grid">
          {/* Left: scanner */}
          <div className="qr-section__scanner">
            <QRModal onScan={handleScan} onImageUpload={handleImageUpload} />
          </div>

          {/* Right: guide */}
          <div className="qr-section__guide">
            <span className="qr-section__eyebrow">How It Works</span>
            <h2 className="qr-section__heading">
              <FontAwesomeIcon
                icon={faQrcode}
                className="qr-section__heading-icon"
              />
              Scan or upload a tag
            </h2>
            <p className="qr-section__body">
              Every asset on campus carries a CICT QR tag. Use your camera to
              scan it live, or upload a photo if you already have one.
            </p>

            <ol className="qr-guide-steps">
              <li className="qr-guide-step">
                <span className="qr-guide-step__number">1</span>
                <div className="qr-guide-step__text">
                  <h3>Point your camera</h3>
                  <p>
                    Allow camera access and hold your device so the QR tag fits
                    inside the frame.
                  </p>
                </div>
              </li>

              <li className="qr-guide-step">
                <span className="qr-guide-step__number">2</span>
                <div className="qr-guide-step__text">
                  <h3>Or upload a photo</h3>
                  <p>
                    No camera handy? Choose an image of the QR tag from your
                    gallery instead.
                  </p>
                </div>
              </li>

              <li className="qr-guide-step">
                <span className="qr-guide-step__number">3</span>
                <div className="qr-guide-step__text">
                  <h3>View asset details</h3>
                  <p>
                    You'll instantly see the asset's history, custodian, and
                    current condition.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* ================= QRINFO OVERLAY ================= */}
      {isAssetPreview && (
        <div className="qrinfo-overlay">
          <div className="qrinfo-overlay__content">
            <QRInfo asset={previewAsset} />
          </div>
        </div>
      )}

      {status && (
        <QRStatusModal
          status={status}
          errorMessage={errorMessage}
          onClose={reset}
        />
      )}
    </main>
  );
}

export default Body;
