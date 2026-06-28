import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./TransferActionModal.css";

const COUNTDOWN = 5;

function TransferActionModal({ type, onClose, onConfirm }) {
  const [remarks, setRemarks] = useState("");
  const [seconds, setSeconds] = useState(COUNTDOWN);
  const [ready, setReady] = useState(false);
  const textareaRef = useRef(null);

  const isApprove = type === "approve";

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // countdown
  useEffect(() => {
    if (ready) return;
    if (seconds === 0) {
      setReady(true);
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, ready]);

  return (
    <div className="transfer-action-overlay" onClick={onClose}>
      <div
        className="transfer-action-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-action-title"
      >
        {/* Header */}
        <div
          className={`transfer-action-header ${isApprove ? "transfer-action-header--approve" : "transfer-action-header--decline"}`}
        >
          <h2 id="transfer-action-title">
            {isApprove ? "Approve Transfer" : "Decline Transfer"}
          </h2>
          <button
            className="transfer-action-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="transfer-action-body">
          {/* Info box */}
          <div className="transfer-action-info">
            <FontAwesomeIcon
              icon="fa-solid fa-circle-info"
              className="transfer-action-info-icon"
            />
            <p className="transfer-action-info-text">
              {isApprove
                ? "Approving this request will proceed with the transfer. This action cannot be undone."
                : "Declining this request will cancel the transfer. This action cannot be undone."}
            </p>
          </div>

          {/* Remarks */}
          <div className="transfer-action-field">
            <label htmlFor="transfer-remarks">
              Remarks{" "}
              <span className="transfer-action-optional">(optional)</span>
            </label>
            <textarea
              id="transfer-remarks"
              ref={textareaRef}
              placeholder="Add a note or reason…"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              maxLength={300}
              rows={3}
            />
            <span className="transfer-action-char-count">
              {remarks.trim().length}/300
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="transfer-action-footer">
          <button
            className="transfer-action-modal-btn transfer-action-modal-btn--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`transfer-action-modal-btn ${isApprove ? "transfer-action-modal-btn--approve" : "transfer-action-modal-btn--decline"}`}
            onClick={() => onConfirm(remarks.trim())}
            disabled={!ready}
          >
            {!ready
              ? `${isApprove ? "Approve" : "Decline"} (${seconds}s)`
              : isApprove
                ? "Approve"
                : "Decline"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransferActionModal;
