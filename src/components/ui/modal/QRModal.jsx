import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faUpload,
  faQrcode,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import "./QRModal.css";

function QRModal({ onCameraScan, onImageUpload }) {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    console.log("File selected:", file);
    if (file && onImageUpload) {
      onImageUpload(file);
    } else if (file) {
      console.log("No onImageUpload handler provided");
    }
    e.target.value = "";
  };

  return (
    <div className="qr-modal-box">
      <div className="qr-modal-title">SCAN QR</div>

      <div className="qr-modal-frame">
        <span className="qr-modal-corner qr-modal-corner-tl" />
        <span className="qr-modal-corner qr-modal-corner-tr" />
        <span className="qr-modal-corner qr-modal-corner-bl" />
        <span className="qr-modal-corner qr-modal-corner-br" />
        <FontAwesomeIcon icon={faQrcode} className="qr-modal-icon-qr" />
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="qr-modal-icon-glass"
        />
      </div>

      <div className="qr-modal-actions">
        <button
          type="button"
          className="qr-modal-btn qr-modal-btn-primary"
          onClick={onCameraScan}
        >
          <FontAwesomeIcon icon={faCamera} />
          Camera Scan
        </button>

        <button
          type="button"
          className="qr-modal-btn qr-modal-btn-secondary"
          onClick={handleUploadClick}
        >
          <FontAwesomeIcon icon={faUpload} />
          Upload Image
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="qr-modal-file-input"
          onChange={handleFileChange}
        />
      </div>

      <p className="qr-modal-hint">
        Scan the QR code attached to school assets such as desktops, chairs,
        tables, and other equipment.
      </p>
    </div>
  );
}

export default QRModal;
