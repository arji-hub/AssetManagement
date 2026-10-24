import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddingStatusModal from "../ui/status/AddingStatusModal";
import "./AuditSaveRoomModal.css"; // reuses the audit-save-confirm-* shell
import "./ReportDamageModal.css";

const MIN_NARRATIVE_LENGTH = 5;
// Matches ReportModal's rule: damaged reports need photo evidence.
// Set to false to make the photo optional.
const REQUIRE_PHOTO = true;

function ReportDamageModal({ isOpen, item, onClose, onSubmit }) {
  const [phase, setPhase] = useState("form"); // "form" | "loading" | "success" | "error"
  const [narrative, setNarrative] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [reportNo, setReportNo] = useState(null);

  // Reset every time the modal is (re)opened
  useEffect(() => {
    if (isOpen) {
      setPhase("form");
      setNarrative("");
      setPhoto(null);
      setStatusError(null);
      setReportNo(null);
    }
  }, [isOpen]);

  // Build / clean up the preview URL whenever the photo changes
  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  if (!isOpen || !item) return null;

  const canSubmit =
    narrative.trim().length >= MIN_NARRATIVE_LENGTH &&
    (!REQUIRE_PHOTO || !!photo);
  const assetLabel = item.asset_id ?? item.id;

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (file) setPhoto(file);
  }

  function handleRemovePhoto() {
    setPhoto(null);
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setPhase("loading");
    const result = await onSubmit?.({ narrative: narrative.trim(), photo });

    if (result?.ok === false) {
      setStatusError(
        result.error?.message || "Failed to file the report. Please try again.",
      );
      setPhase("error");
      return;
    }

    setReportNo(result?.report_no ?? null);
    setPhase("success");
  }

  function handleStatusClose() {
    if (phase === "success") {
      onClose?.();
    } else {
      setPhase("form"); // keep what they typed and let them retry
    }
  }

  if (phase !== "form") {
    return (
      <AddingStatusModal
        title="Damage Report"
        status={phase}
        errorMessage={statusError}
        loadingMessage="Please wait while we file this report..."
        successTitle="Report Filed"
        successMessage={
          reportNo
            ? `${reportNo} was filed for ${assetLabel}.`
            : `The damage report for ${assetLabel} was filed.`
        }
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
        <div className="audit-save-header report-damage-header">
          <div className="audit-save-confirm-icon">
            <FontAwesomeIcon
              icon="fa-solid fa-triangle-exclamation"
              aria-hidden="true"
            />
          </div>
          <h3>Report as damaged</h3>
        </div>

        <p className="report-damage-asset">
          <strong>{item.description ? `${item.description}` : ""}</strong>
        </p>

        <label className="report-damage-field">
          <span className="report-damage-label">What is damaged?</span>
          <textarea
            className="report-damage-textarea"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Describe the damage…"
            rows={4}
            maxLength={500}
            autoFocus
          />
          <span className="report-damage-char-count">
            {narrative.trim().length}/500
          </span>
        </label>

        {/* photo */}
        <div className="report-damage-field">
          <span className="report-damage-label">
            {REQUIRE_PHOTO ? "Photo of Damage" : "Photo of Damage (optional)"}
          </span>

          {photoPreview ? (
            <div className="report-damage-photo-preview">
              <img src={photoPreview} alt="Damage preview" />
              <button
                type="button"
                className="report-damage-photo-remove"
                onClick={handleRemovePhoto}
                aria-label="Remove photo"
              >
                <FontAwesomeIcon icon="fa-solid fa-xmark" />
              </button>
            </div>
          ) : (
            <label className="report-damage-photo-upload">
              <FontAwesomeIcon icon="fa-solid fa-camera" />
              <span>Click to upload photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </label>
          )}
        </div>

        <div className="report-damage-footer">
          <button
            type="button"
            className="report-damage-btn report-damage-btn--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="report-damage-btn report-damage-btn--submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            <FontAwesomeIcon
              icon="fa-solid fa-paper-plane"
              aria-hidden="true"
            />
            Submit report
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportDamageModal;
