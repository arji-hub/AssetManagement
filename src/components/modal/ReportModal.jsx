// components/modal/ReportModal.jsx

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useReportRegistration from "../../hooks/report/useReportRegistration";
import "./ReportModal.css";
import { REPORT_TYPES } from "../../data/reports";
import AddingStatusModal from "../ui/status/AddingStatusModal";
import SearchableSelect from "../form/SearchableSelect";

function ReportModal({ onClose, assetID = "" }) {
  const {
    type,
    asset,
    assetOptions,
    selectedAssetId,
    assetsLoading,
    assetError,
    description,
    narrative,
    photoPreview,
    submitError,
    isSubmitting,
    isFormValid,
    setNarrative,
    handleAssetSelect,
    handleTypeChange,
    handlePhotoChange,
    handleRemovePhoto,
    handleSubmit,
    submitStatus,
    handleStatusClose,
  } = useReportRegistration({ onClose, assetID });

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
      <div className="report-modal-overlay" onClick={onClose}>
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
              <div
                className={`report-modal-type-toggle${type === "missing" ? " active-missing" : ""}`}
              >
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

            {/* asset select */}
            <div
              className={`report-modal-field ${assetError ? "has-error" : ""}`}
            >
              <label>Asset</label>
              {/* fieldset[disabled] natively disables the select's trigger
                  without needing a disabled prop on SearchableSelect */}
              <fieldset
                className="report-modal-select-wrap"
                disabled={isSubmitting || !!assetID}
              >
                <SearchableSelect
                  options={assetOptions}
                  value={selectedAssetId}
                  onSelect={handleAssetSelect}
                  placeholder="Select an asset…"
                  searchPlaceholder="Search by ID or description…"
                  emptyMessage="No assets found."
                  loading={assetsLoading}
                  error={!!assetError}
                />
              </fieldset>
              {assetError && (
                <span className="report-modal-error" role="alert">
                  {assetError}
                </span>
              )}
            </div>

            {/* asset preview */}
            {asset && (
              <div className="report-modal-asset-preview">
                <FontAwesomeIcon icon="fa-solid fa-circle-check" />
                <div>
                  <p className="report-modal-asset-preview-title">
                    {asset.description || asset.id}
                  </p>
                  <p className="report-modal-asset-preview-sub">
                    {asset.room_name || "—"} ·{" "}
                    {asset.property_custodian_fullname || "—"}
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
                placeholder="Auto-filled once an asset is selected"
                disabled={!asset}
              />
            </div>

            {/* narrative */}
            <div className="report-modal-field">
              <label htmlFor="report-note-input">Narrative</label>
              <textarea
                id="report-note-input"
                placeholder="Describe what happened..."
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
              />
              <span className="report-modal-char-count">
                {narrative.trim().length}/500
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
                Select the asset — the description fills in automatically.
                Damaged reports require a photo as evidence; missing reports do
                not.
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
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReportModal;
