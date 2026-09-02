import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import AddingStatusModal from "../ui/status/AddingStatusModal";
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
  const [phase, setPhase] = useState("confirm"); // "confirm" | "loading" | "success" | "error"
  const [statusError, setStatusError] = useState(null);

  // Reset to the confirm view every time the modal is (re)opened
  useEffect(() => {
    if (isOpen) {
      setPhase("confirm");
      setStatusError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const remaining = Math.max(totalAssets - auditedCount, 0);
  const hasDiscrepancies = discrepancyCount > 0;
  const hasRemaining = remaining > 0;

  async function handleConfirm() {
    setPhase("loading");
    const result = await onConfirm?.();

    if (result?.ok === false) {
      setStatusError(
        result.error?.message ||
          "Failed to complete the audit. Please try again.",
      );
      setPhase("error");
      return;
    }

    setPhase("success");
  }

  function handleStatusClose() {
    if (phase === "success") {
      onClose?.(); // fully close, parent already knows audit is complete
    } else {
      setPhase("confirm"); // let the user retry from the confirm view
    }
  }

  if (phase !== "confirm") {
    return (
      <AddingStatusModal
        title="Audit"
        status={phase}
        errorMessage={statusError}
        loadingMessage="Please wait while we complete this audit..."
        successTitle="Audit Completed"
        successMessage={`The audit${roomName ? ` for ${roomName}` : ""} has been marked as completed.`}
        onClose={handleStatusClose}
      />
    );
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
