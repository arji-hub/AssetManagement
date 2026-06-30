import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./QRStatusModal.css";

function QRStatusModal({ status, errorMessage, onClose }) {
  return (
    <div className="qr-status-overlay">
      <div className="qr-status-container">
        {/* ── Loading ── */}
        {status === "loading" && (
          <>
            <div className="qr-status-spinner" />
            <h2 className="qr-status-title">Scanning QR Code</h2>
            <p className="qr-status-message">
              Please wait while we read the QR code...
            </p>
          </>
        )}

        {/* ── Success ── */}
        {status === "success" && (
          <>
            <div className="qr-status-icon qr-status-icon--success">
              <FontAwesomeIcon icon="fa-solid fa-circle-check" />
            </div>
            <h2 className="qr-status-title">Asset Found</h2>
            <p className="qr-status-message">
              Redirecting you to the asset information...
            </p>
          </>
        )}

        {/* ── Not Found ── */}
        {status === "notfound" && (
          <>
            <div className="qr-status-icon qr-status-icon--error">
              <FontAwesomeIcon icon="fa-solid fa-circle-xmark" />
            </div>
            <h2 className="qr-status-title">Invalid QR Code</h2>
            <p className="qr-status-message qr-status-message--error">
              {errorMessage ||
                "This QR code does not point to a valid asset."}
            </p>
            <button
              className="qr-status-btn qr-status-btn--error"
              onClick={onClose}
            >
              Try Again
            </button>
          </>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <>
            <div className="qr-status-icon qr-status-icon--error">
              <FontAwesomeIcon icon="fa-solid fa-circle-xmark" />
            </div>
            <h2 className="qr-status-title">Scan Failed</h2>
            <p className="qr-status-message qr-status-message--error">
              {errorMessage ||
                "Could not read a QR code from the selected image."}
            </p>
            <button
              className="qr-status-btn qr-status-btn--error"
              onClick={onClose}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

QRStatusModal.propTypes = {
  status: PropTypes.oneOf(["loading", "success", "notfound", "error"])
    .isRequired,
  errorMessage: PropTypes.string,
  onClose: PropTypes.func,
};

export default QRStatusModal;