import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./GenerateReportLogModal.css";

const MAX_LENGTH = 50;

function GenerateReportLogModal({
  logName,
  setLogName,
  selectedCount,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const isValid = logName.trim().length > 0;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isValid && !isSubmitting) {
      onSubmit();
    }
  };

  return (
    <div className="generate-report-log-modal-overlay">
      <div
        className="generate-report-log-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="generate-report-log-modal-title"
      >
        {/* Header */}
        <div className="generate-report-log-modal-header">
          <h2 id="generate-report-log-modal-title">Name This Report Log</h2>
          <button
            className="generate-report-log-modal-close"
            onClick={onClose}
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="generate-report-log-modal-body">
          <div className="generate-report-log-modal-field">
            <label htmlFor="generate-report-log-name-input">Log Name</label>
            <input
              id="generate-report-log-name-input"
              type="text"
              placeholder="e.g. July 2026 Incidents"
              value={logName}
              onChange={(e) => setLogName(e.target.value.slice(0, MAX_LENGTH))}
              onKeyDown={handleKeyDown}
              maxLength={MAX_LENGTH}
              disabled={isSubmitting}
              autoFocus
            />
            <span className="generate-report-log-modal-char-count">
              {logName.length}/{MAX_LENGTH}
            </span>
          </div>

          <div className="generate-report-log-modal-summary">
            <FontAwesomeIcon icon="fa-solid fa-circle-check" />
            <p>
              {selectedCount} report{selectedCount === 1 ? "" : "s"} will be
              included in this log.
            </p>
          </div>

          <div className="modal-info">
            <FontAwesomeIcon
              icon="fa-solid fa-circle-info"
              className="info-icon"
            />
            <p className="info-text">
              This name helps you identify the log later. It cannot be changed
              after the log is created.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="generate-report-log-modal-footer">
          <button
            className="generate-report-log-modal-btn generate-report-log-modal-btn--cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="generate-report-log-modal-btn generate-report-log-modal-btn--submit"
            onClick={onSubmit}
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? "Generating..." : "Generate Log"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateReportLogModal;
