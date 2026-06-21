import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchAssetByID } from "../../../services/asset";
import "./ReportModal.css";

const REPORT_TYPES = [
  { value: "damaged", label: "Damaged" },
  { value: "missing", label: "Missing" },
];

function ReportModal({ onClose, onSubmit, isSubmitting = false }) {
  const assetInputRef = useRef(null);

  const [type, setType] = useState("damaged");

  // asset lookup
  const [assetId, setAssetId] = useState("");
  const [asset, setAsset] = useState(null);
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState(null);

  // form fields
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    assetInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // clean up object URL on unmount / photo change
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // switching type clears the photo — missing reports shouldn't carry one
  const handleTypeChange = (nextType) => {
    setType(nextType);
    if (nextType === "missing") {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhoto(null);
      setPhotoPreview(null);
    }
  };

  const handleFindAsset = async () => {
    const trimmedId = assetId.trim();
    if (!trimmedId) return;

    setAssetLoading(true);
    setAssetError(null);
    setAsset(null);
    setDescription("");

    try {
      const result = await fetchAssetByID(trimmedId);
      setAsset(result);
      setDescription(
        `${result.description || "Asset"} (${result.category_id || "—"}) located at ${result.room_id || "—"}, assigned to ${result.property_custodian_name || "—"}.`,
      );
    } catch (err) {
      setAssetError(err.message || "Failed to fetch asset.");
    } finally {
      setAssetLoading(false);
    }
  };

  const handleAssetIdKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFindAsset();
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = () => {
    setSubmitError(null);

    if (!asset) {
      setSubmitError("Please find a valid asset before submitting.");
      return;
    }
    if (!note.trim()) {
      setSubmitError("Please describe what happened.");
      return;
    }
    if (type === "damaged" && !photo) {
      setSubmitError("Please attach a photo of the damage.");
      return;
    }

    onSubmit({
      type,
      asset_id: asset.id,
      description,
      note: note.trim(),
      photo: type === "damaged" ? photo : null,
    });
  };

  const isFormValid =
    !!asset && note.trim().length > 0 && (type !== "damaged" || !!photo);

  return (
    <div className="report-modal-overlay">
      <div
        className="report-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        {/* Header */}
        <div className="report-modal-header">
          <h2 id="report-modal-title">Report Incident</h2>
          <button
            className="report-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="report-modal-body">
          {/* type toggle */}
          <div className="report-modal-field">
            <label>Incident Type</label>
            <div className="report-modal-type-toggle">
              {REPORT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`report-modal-type-btn${type === t.value ? " active" : ""}`}
                  onClick={() => handleTypeChange(t.value)}
                  disabled={isSubmitting}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* asset id lookup */}
          <div
            className={`report-modal-field ${assetError ? "has-error" : ""}`}
          >
            <label htmlFor="report-asset-id-input">Asset ID</label>
            <div className="report-modal-asset-lookup">
              <input
                id="report-asset-id-input"
                ref={assetInputRef}
                type="text"
                placeholder="e.g. cict-I001"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                onKeyDown={handleAssetIdKeyDown}
                disabled={isSubmitting || assetLoading}
              />
              <button
                type="button"
                className="report-modal-find-btn"
                onClick={handleFindAsset}
                disabled={isSubmitting || assetLoading || !assetId.trim()}
              >
                {assetLoading ? (
                  <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
                ) : (
                  <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
                )}
              </button>
            </div>
            {assetError && (
              <span className="report-modal-error" role="alert">
                {assetError}
              </span>
            )}
          </div>

          {/* asset preview — confirms the correct asset was found */}
          {asset && (
            <div className="report-modal-asset-preview">
              <FontAwesomeIcon icon="fa-solid fa-circle-check" />
              <div>
                <p className="report-modal-asset-preview-title">
                  {asset.description || asset.id}
                </p>
                <p className="report-modal-asset-preview-sub">
                  {asset.room_id || "—"} ·{" "}
                  {asset.property_custodian_name || "—"}
                </p>
              </div>
            </div>
          )}

          {/* auto-generated description */}
          <div className="report-modal-field">
            <label htmlFor="report-description-input">Description</label>
            <input
              id="report-description-input"
              type="text"
              value={description}
              readOnly
              placeholder="Auto-generated once asset is found"
              disabled={!asset}
            />
          </div>

          {/* note / narrative */}
          <div className="report-modal-field">
            <label htmlFor="report-note-input">Note</label>
            <textarea
              id="report-note-input"
              placeholder="Describe what happened..."
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

          {/* photo — damaged only */}
          {type === "damaged" && (
            <div className="report-modal-field">
              <label htmlFor="report-photo-input">Photo of Damage</label>
              {photoPreview ? (
                <div className="report-modal-photo-preview">
                  <img src={photoPreview} alt="Damage preview" />
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
                    id="report-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>
          )}

          {submitError && (
            <div className="report-modal-submit-error" role="alert">
              {submitError}
            </div>
          )}

          {/* Info box */}
          <div className="modal-info">
            <FontAwesomeIcon
              icon="fa-solid fa-circle-info"
              className="info-icon"
            />
            <p className="info-text">
              Find the asset by its ID first — the description fills in
              automatically. Damaged reports require a photo as evidence;
              missing reports do not.
            </p>
          </div>
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
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
