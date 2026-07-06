import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./ViewAssetQr.css";

function ViewAssetQR({ qr_code_url, assetID }) {
  const [isQRActive, setIsQRActive] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(qr_code_url);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Asset${assetID}QR.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download QR code:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <button className="action-btn" onClick={() => setIsQRActive(true)}>
        <FontAwesomeIcon icon="fa-solid fa-qrcode" /> QR Code
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
            <div className="qr-modal-actions">
              <button
                className="qr-modal-download"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <FontAwesomeIcon icon="fa-solid fa-download" />
                {isDownloading ? "Downloading..." : "Download"}
              </button>
              <button
                className="qr-modal-close"
                onClick={() => setIsQRActive(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ViewAssetQR;
