import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTransferAction } from "../../../hooks/transfer/useTransferAction";
import "./TransferActionModal.css";

function TransferActionModal({ type, onClose, onConfirm }) {
  const {
    remarks,
    setRemarks,
    seconds,
    ready,
    textareaRef,
    isApprove,
    handleConfirm,
  } = useTransferAction(type, onClose, onConfirm);

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
            onClick={handleConfirm}
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