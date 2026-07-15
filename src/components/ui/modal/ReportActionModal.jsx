import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useReportAction from "../../../hooks/report/useReportAction";
import AddingStatusModal from "../status/AddingStatusModal";
import { ACTION_LABELS } from "../../../data/reports";
import "./ReportModal.css";

function ReportActionModal({ report, newStatus, onClose, onSuccess }) {
  const label = ACTION_LABELS[newStatus] ?? newStatus;

  const {
    note,
    setNote,
    photoPreview,
    isSubmitting,
    isFormValid,
    submitStatus,
    submitError,
    handlePhotoChange,
    handleRemovePhoto,
    handleSubmit,
    handleStatusClose,
  } = useReportAction({ report, onClose, onSuccess });

  return (
    <>
      {submitStatus && (
        <AddingStatusModal
          title="Report"
          status={submitStatus}
          errorMessage={submitError}
          onClose={handleStatusClose}
        />
      )}
      <div className="report-modal-overlay">
        <div
          className="report-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-action-modal-title"
        >
          {/* Header */}
          <div className="report-modal-header">
            <h2 id="report-action-modal-title">{label}</h2>
            <button
              className="report-modal-close"
              onClick={onClose}
              aria-label="Close modal"
              disabled={isSubmitting}
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div className="report-modal-body">
            {/* Report context */}
            <div className="report-modal-asset-preview">
              <FontAwesomeIcon icon="fa-solid fa-file-lines" />
              <div>
                <p className="report-modal-asset-preview-title">
                  {report.description}
                </p>
                <p className="report-modal-asset-preview-sub">
                  {report.report_no} · {report.location || "—"}
                </p>
              </div>
            </div>

            {/* Note */}
            <div className="report-modal-field">
              <label htmlFor="report-action-note">Note</label>
              <textarea
                id="report-action-note"
                placeholder="Describe the update..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
              />
              <span className="report-modal-char-count">
                {note.trim().length}/500
              </span>
            </div>

            {/* Photo */}
            <div className="report-modal-field">
              <label htmlFor="report-action-photo">
                Photo{" "}
                <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                  (optional)
                </span>
              </label>
              {photoPreview ? (
                <div className="report-modal-photo-preview">
                  <img src={photoPreview} alt="Upload preview" />
                  <button
                    type="button"
                    className="report-modal-photo-remove"
                    onClick={handleRemovePhoto}
                    aria-label="Remove photo"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-xmark" />
                  </button>
                </div>
              ) : (
                <label className="report-modal-photo-upload">
                  <FontAwesomeIcon icon="fa-solid fa-camera" />
                  <span>Click to upload photo</span>
                  <input
                    id="report-action-photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>

            {submitError && (
              <div className="report-modal-submit-error" role="alert">
                {submitError}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="report-modal-footer">
            <button
              className="report-modal-btn report-modal-btn--cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="report-modal-btn report-modal-btn--submit"
              onClick={() => handleSubmit(newStatus)}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? "Submitting..." : label}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReportActionModal;
