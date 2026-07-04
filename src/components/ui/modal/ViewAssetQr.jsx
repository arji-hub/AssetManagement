import React, { useState } from "react";
import "./ViewAssetQR.css";

function ViewAssetQR({ qr_code_url }) {
  const [isQRActive, setIsQRActive] = useState(false);

  return (
    <>
      <button className="action-btn" onClick={() => setIsQRActive(true)}>
        <i className="ti ti-qrcode" aria-hidden="true" /> QR Code
      </button>

      {isQRActive && (
        <div className="qr-modal-overlay" onClick={() => setIsQRActive(false)}>
          <div
            className="qr-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={qr_code_url}
              alt="Asset QR Code"
              className="qr-modal-image"
            />
            <button
              className="qr-modal-close"
              onClick={() => setIsQRActive(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ViewAssetQR;
