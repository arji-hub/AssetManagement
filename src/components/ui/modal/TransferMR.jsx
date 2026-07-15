import { React, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTransferMR from "../../../hooks/transfer/useTransferMR";
import "./TransferModal.css";
import AddingStatusModal from "../status/AddingStatusModal";

function TransferMR({ onClose, assetID = "" }) {
  const {
    mode,
    setMode,
    isPartTime,
    assetInputRef,
    assetId,
    asset,
    assetLoading,
    assetError,
    mrId,
    mr,
    mrLoading,
    mrError,
    description,
    currentMR,
    notes,
    submitError,
    isSubmitting,
    isFormValid,
    setAssetId,
    setMrId,
    setNotes,
    handleFindAsset,
    handleAssetIdKeyDown,
    handleFindMR,
    localmrOptions,
    handleMrIdKeyDown,
    handleSubmit,
    submitStatus,
    handleStatusClose,
  } = useTransferMR({ onClose, assetID });

  const isRemoveMode = mode === "remove";
  const [showDropdown, setShowDropdown] = useState(false);
  const filteredOptions = localmrOptions.filter(
    (c) =>
      c.email.toLowerCase().includes(mrId.toLowerCase()) ||
      c.fullname.toLowerCase().includes(mrId.toLowerCase()),
  );

  return (
    <>
      {submitStatus && (
        <AddingStatusModal
          title={isRemoveMode ? "Remove Local MR" : "Assign Local MR"}
          status={submitStatus}
          errorMessage={submitError}
          onClose={handleStatusClose}
        />
      )}
      <div className="transfer-modal-overlay">
        <div
          className="transfer-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mr-modal-title"
        >
          {/* Header */}
          <div className="transfer-modal-header">
            <h2 id="mr-modal-title">
              {isRemoveMode ? "Remove Local MR" : "Assign Local MR"}
            </h2>
            <button
              className="transfer-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div className="transfer-modal-body">
            {/* mode toggle */}
            <div
              className="transfer-modal-mode"
              role="tablist"
              aria-label="Local MR action"
            >
              {!isPartTime && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isRemoveMode}
                  className={`transfer-modal-mode-btn${!isRemoveMode ? " is-active" : ""}`}
                  onClick={() => setMode("assign")}
                  disabled={isSubmitting}
                >
                  <FontAwesomeIcon icon="fa-solid fa-user-plus" />
                  Assign
                </button>
              )}
              <button
                type="button"
                role="tab"
                aria-selected={isRemoveMode}
                className={`transfer-modal-mode-btn is-remove${isRemoveMode ? " is-active" : ""}`}
                onClick={() => setMode("remove")}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon="fa-solid fa-user-xmark" />
                Remove
              </button>
            </div>

            {/* asset id lookup */}
            <div
              className={`transfer-modal-field ${assetError ? "has-error" : ""}`}
            >
              <label htmlFor="mr-asset-id-input">Asset ID</label>
              <div className="transfer-modal-lookup">
                <input
                  id="mr-asset-id-input"
                  ref={assetInputRef}
                  type="text"
                  placeholder="e.g. cict-1002"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  onKeyDown={handleAssetIdKeyDown}
                  disabled={isSubmitting || assetLoading || !!assetID}
                />
                <button
                  type="button"
                  className="transfer-modal-find-btn"
                  onClick={handleFindAsset}
                  disabled={
                    isSubmitting || assetLoading || !assetId.trim() || !!assetID
                  }
                >
                  {assetLoading ? (
                    <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
                  ) : (
                    <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
                  )}
                </button>
              </div>
              {assetError && (
                <span className="transfer-modal-error" role="alert">
                  {assetError}
                </span>
              )}
            </div>

            {/* asset preview */}
            {asset && (
              <div className="transfer-modal-preview">
                <FontAwesomeIcon icon="fa-solid fa-circle-check" />
                <div>
                  <p className="transfer-modal-preview-title">
                    {asset.description || asset.id}
                  </p>
                  <p className="transfer-modal-preview-sub">
                    {asset.room_id || "—"} ·{" "}
                    {asset.property_custodian_name || "—"}
                  </p>
                </div>
              </div>
            )}

            {/* auto-generated description */}
            <div className="transfer-modal-field">
              <label htmlFor="mr-description-input">Description</label>
              <input
                id="mr-description-input"
                type="text"
                value={description}
                readOnly
                placeholder="Auto-generated once asset is found"
                disabled={!asset}
              />
            </div>

            {/* property custodian — read-only context, this flow never changes it */}
            <div className="transfer-modal-field">
              <label htmlFor="mr-custodian-input">Property Custodian</label>
              <input
                id="mr-custodian-input"
                type="text"
                value={asset?.property_custodian_name || "—"}
                readOnly
                placeholder="Auto-generated once asset is found"
                disabled={!asset}
              />
            </div>

            {/* current local mr */}
            {isRemoveMode && (
              <div className="transfer-modal-field">
                <label htmlFor="mr-current-input">Current Local MR</label>
                <input
                  id="mr-current-input"
                  type="text"
                  value={currentMR || "—"}
                  readOnly
                  placeholder="Auto-generated once asset is found"
                  disabled={!asset}
                />
              </div>
            )}

            {/* local mr ("to") lookup — hidden in remove mode */}
            {!isRemoveMode && (
              <div
                className={`transfer-modal-field ${mrError ? "has-error" : ""}`}
              >
                <label htmlFor="mr-id-input">Assign Local MR</label>
                <div className="transfer-modal-lookup transfer-autocomplete-wrapper">
                  <input
                    id="mr-id-input"
                    type="text"
                    autoComplete="off"
                    placeholder="Search by username or email"
                    value={mrId}
                    onChange={(e) => {
                      setMrId(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 120)}
                    onKeyDown={handleMrIdKeyDown}
                    disabled={isSubmitting || mrLoading}
                  />
                  {showDropdown && filteredOptions.length > 0 && (
                    <ul className="transfer-autocomplete-list">
                      {filteredOptions.map((c) => (
                        <li
                          key={c.uid}
                          onMouseDown={() => {
                            setMrId(c.email);
                            setShowDropdown(false);
                          }}
                        >
                          <span className="transfer-autocomplete-name">
                            {c.fullname}
                          </span>
                          <span className="transfer-autocomplete-email">
                            {c.email}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    className="transfer-modal-find-btn"
                    onClick={handleFindMR}
                    disabled={isSubmitting || mrLoading || !mrId.trim()}
                  >
                    {mrLoading ? (
                      <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
                    ) : (
                      <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
                    )}
                  </button>
                </div>
                {mrError && (
                  <span className="transfer-modal-error" role="alert">
                    {mrError}
                  </span>
                )}
              </div>
            )}

            {/* mr preview — only relevant in assign mode */}
            {!isRemoveMode && mr && (
              <div className="transfer-modal-preview">
                <FontAwesomeIcon icon="fa-solid fa-circle-check" />
                <div>
                  <p className="transfer-modal-preview-title">{mr.fullname}</p>
                  <p className="transfer-modal-preview-sub">
                    {mr.username || "—"} · {mr.email || "—"}
                  </p>
                </div>
              </div>
            )}

            {/* notes */}
            <div className="transfer-modal-field">
              <label htmlFor="mr-notes-input">Notes (optional)</label>
              <textarea
                id="mr-notes-input"
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
              />
              <span className="transfer-modal-char-count">
                {notes.trim().length}/500
              </span>
            </div>

            {submitError && (
              <div className="transfer-modal-submit-error" role="alert">
                {submitError}
              </div>
            )}

            {/* Info box */}
            <div className={`modal-info${isRemoveMode ? " is-warning" : ""}`}>
              <FontAwesomeIcon
                icon={
                  isRemoveMode
                    ? "fa-solid fa-triangle-exclamation"
                    : "fa-solid fa-circle-info"
                }
                className="info-icon"
              />
              <p className="info-text">
                {isRemoveMode
                  ? "This will unassign the local MR from this asset. The asset's property custodian will still need to acknowledge."
                  : "Only the asset's property custodian can assign a local MR. They'll need to acknowledge this assignment."}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="transfer-modal-footer">
            <button
              className="transfer-modal-btn transfer-modal-btn--cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="transfer-modal-btn transfer-modal-btn--submit"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting
                ? "Submitting..."
                : isRemoveMode
                  ? "Submit Removal"
                  : "Submit Assignment"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default TransferMR;
