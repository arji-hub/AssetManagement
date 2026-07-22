import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./AuditSaveRoomModal.css";

function AuditConfirmSaveModal({
  isOpen,
  onClose,
  onConfirm,
  roomName,
  auditedCount = 0,
  totalAssets = 0,
  discrepancyCount = 0,
}) {
  if (!isOpen) return null;

  const remaining = Math.max(totalAssets - auditedCount, 0);
  const hasDiscrepancies = discrepancyCount > 0;
  const hasRemaining = remaining > 0;

  function handleConfirm() {
    onConfirm?.();
  }

  return (
    <div className="audit-save-confirm-overlay" onClick={onClose}>
      <div
        className="audit-save-confirm-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="audit-save-header">
          <div className="audit-save-confirm-icon">
            <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" />
          </div>
          <h3>Complete this audit?</h3>
        </div>

        <p>
          This will mark the audit{roomName ? ` for ${roomName}` : ""} as
          completed. Once completed, it can no longer be edited.
        </p>

        {totalAssets > 0 && (
          <div className="audit-save-confirm-summary">
            <div className="audit-save-confirm-stat">
              <span className="audit-save-confirm-stat-value">
                {auditedCount}/{totalAssets}
              </span>
              <span className="audit-save-confirm-stat-label">
                Assets audited
              </span>
            </div>
            <div className="audit-save-confirm-stat">
              <span
                className={
                  hasDiscrepancies
                    ? "audit-save-confirm-stat-value audit-save-confirm-stat-flag"
                    : "audit-save-confirm-stat-value"
                }
              >
                {discrepancyCount}
              </span>
              <span className="audit-save-confirm-stat-label">
                Discrepancies
              </span>
            </div>
          </div>
        )}

        {hasRemaining && (
          <p className="audit-save-confirm-warning">
            <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" />
            {remaining} asset{remaining === 1 ? "" : "s"} not yet audited.
          </p>
        )}

        <div className="audit-save-confirm-actions">
          <button
            type="button"
            className="audit-save-confirm-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="audit-save-confirm-proceed"
            onClick={handleConfirm}
          >
            <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuditConfirmSaveModal;
