// components/ui/modal/AuditScanModal.jsx
import React, { useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAuditScanner from "../../../hooks/audit/useAuditScanner";
import "./AuditScanModal.css";

const FEEDBACK_ICONS = {
  success: "fa-solid fa-circle-check",
  error: "fa-solid fa-triangle-exclamation",
};

// == Local presentational helpers ==========================================

function ScanFeedback({ feedback }) {
  if (!feedback) return null;

  return (
    <div
      className={`audit-scan-feedback audit-scan-feedback--${feedback.type}`}
    >
      <FontAwesomeIcon icon={FEEDBACK_ICONS[feedback.type]} />
      {feedback.message}
    </div>
  );
}

function ScanReticle() {
  return (
    <div className="audit-scan-reticle">
      <span className="audit-scan-reticle-corner audit-scan-reticle-corner--tl" />
      <span className="audit-scan-reticle-corner audit-scan-reticle-corner--tr" />
      <span className="audit-scan-reticle-corner audit-scan-reticle-corner--bl" />
      <span className="audit-scan-reticle-corner audit-scan-reticle-corner--br" />
      <div className="audit-scan-reticle-sweep" />
    </div>
  );
}

function DiscrepancyOverlay({ assetId, onScanAgain, onAddToDiscrepancy }) {
  return (
    <div className="audit-scan-discrepancy">
      <FontAwesomeIcon
        icon="fa-solid fa-triangle-exclamation"
        className="audit-scan-discrepancy-icon"
      />
      <p className="audit-scan-discrepancy-title">Asset not in this room</p>
      <p className="audit-scan-discrepancy-detail">
        Scanned code <strong>{assetId}</strong> doesn't belong to this audit.
      </p>

      <div className="audit-scan-discrepancy-actions">
        <button
          type="button"
          className="audit-scan-discrepancy-dismiss"
          onClick={onScanAgain}
        >
          Scan again
        </button>
        <button
          type="button"
          className="audit-scan-discrepancy-report"
          onClick={onAddToDiscrepancy}
        >
          <FontAwesomeIcon icon="fa-solid fa-flag" />
          Add to discrepancy
        </button>
      </div>
    </div>
  );
}

// == Component ==============================================================

function AuditScanModal({ onDetect, validAssetIds, scannerState }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mismatchedAssetId, setMismatchedAssetId] = useState(null);
  const fileInputRef = useRef(null);

  const openModal = useCallback(() => {
    setMismatchedAssetId(null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setMismatchedAssetId(null);
  }, []);

  const handleRawDetect = useCallback(
    (assetId) => {
      const isValid = validAssetIds?.has(assetId) ?? false;

      if (!isValid) {
        setMismatchedAssetId(assetId);
        return;
      }

      onDetect(assetId);
    },
    [validAssetIds, onDetect],
  );

  const liveState = useAuditScanner({
    isActive: isOpen && !scannerState && !mismatchedAssetId,
    validAssetIds,
    onDetect: handleRawDetect,
  });

  const { videoRef, canvasRef, error, feedback, handleImageUpload } =
    scannerState ?? liveState;

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && handleImageUpload) {
      handleImageUpload(file);
    }
    e.target.value = "";
  };

  // User confirms the mismatch is real — pass it through to the parent anyway
  // so it still gets recorded (as a discrepancy) instead of being dropped.
  const handleAddToDiscrepancy = useCallback(() => {
    onDetect(mismatchedAssetId);
    setMismatchedAssetId(null);
  }, [onDetect, mismatchedAssetId]);

  if (!isOpen) {
    return (
      <button
        type="button"
        className="audit-scan-trigger-btn"
        onClick={openModal}
      >
        <FontAwesomeIcon icon="fa-solid fa-qrcode" />
        Scan asset
      </button>
    );
  }

  return (
    <div className="audit-scan-modal-overlay">
      <div className="audit-scan-modal">
        <button
          type="button"
          className="audit-scan-close-btn"
          onClick={closeModal}
        >
          <FontAwesomeIcon icon="fa-solid fa-xmark" />
        </button>

        {mismatchedAssetId ? (
          <DiscrepancyOverlay
            assetId={mismatchedAssetId}
            onScanAgain={() => setMismatchedAssetId(null)}
            onAddToDiscrepancy={handleAddToDiscrepancy}
          />
        ) : error ? (
          <div className="audit-scan-error">{error}</div>
        ) : (
          <>
            <p className="audit-scan-hint">Point camera at asset QR code</p>

            <video
              ref={videoRef}
              className="audit-scan-video"
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <ScanReticle />
            <ScanFeedback feedback={feedback} />

            <button
              type="button"
              className="audit-scan-upload-btn"
              onClick={handleUploadClick}
            >
              <FontAwesomeIcon icon="fa-solid fa-image" />
              Upload QR image instead
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default AuditScanModal;
