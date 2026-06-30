
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTransferRequest from "../../../hooks/useTransferRequest";
import "./TransferModal.css";
import AddingStatusModal from "../status/AddingStatusModal";

function TransferModal({ onClose, assetID = "" }) {
  const {
    mode,
    setMode,
    assetInputRef,
    assetId,
    asset,
    assetLoading,
    assetError,
    custodianId,
    custodian,
    custodianLoading,
    custodianError,
    description,
    currentCustodian,
    notes,
    submitError,
    isSubmitting,
    isFormValid,
    setAssetId,
    setCustodianId,
    setNotes,
    handleFindAsset,
    handleAssetIdKeyDown,
    handleFindCustodian,
    handleCustodianIdKeyDown,
    handleSubmit,
    submitStatus,
    handleStatusClose,
  } = useTransferRequest({ onClose, assetID });

  const isRemoveMode = mode === "remove";

  return (
    <>
      {submitStatus && (
        <AddingStatusModal
          title={isRemoveMode ? "Remove Custodian" : "Transfer"}
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
          aria-labelledby="transfer-modal-title"
        >
          {/* Header */}
          <div className="transfer-modal-header">
            <h2 id="transfer-modal-title">
              {isRemoveMode ? "Remove Custodian" : "Transfer Custodian"}
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
              aria-label="Custodian action"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!isRemoveMode}
                className={`transfer-modal-mode-btn${!isRemoveMode ? " is-active" : ""}`}
                onClick={() => setMode("transfer")}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon="fa-solid fa-right-left" />
                Transfer
              </button>
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
              <label htmlFor="transfer-asset-id-input">Asset ID</label>
              <div className="transfer-modal-lookup">
                <input
                  id="transfer-asset-id-input"
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
              <label htmlFor="transfer-description-input">Description</label>
              <input
                id="transfer-description-input"
                type="text"
                value={description}
                readOnly
                placeholder="Auto-generated once asset is found"
                disabled={!asset}
              />
            </div>

            {/* current custodian */}
            <div className="transfer-modal-field">
              <label htmlFor="transfer-current-custodian-input">
                Current Custodian
              </label>
              <input
                id="transfer-current-custodian-input"
                type="text"
                value={currentCustodian || "—"}
                readOnly
                placeholder="Auto-generated once asset is found"
                disabled={!asset}
              />
            </div>

            {/* custodian ("to") lookup — hidden entirely in remove mode */}
            {!isRemoveMode && (
              <div
                className={`transfer-modal-field ${custodianError ? "has-error" : ""}`}
              >
                <label htmlFor="transfer-custodian-id-input">
                  Transfer To (Custodian)
                </label>
                <div className="transfer-modal-lookup">
                  <input
                    id="transfer-custodian-id-input"
                    type="text"
                    placeholder="Search by username or email"
                    value={custodianId}
                    onChange={(e) => setCustodianId(e.target.value)}
                    onKeyDown={handleCustodianIdKeyDown}
                    disabled={isSubmitting || custodianLoading}
                  />
                  <button
                    type="button"
                    className="transfer-modal-find-btn"
                    onClick={handleFindCustodian}
                    disabled={
                      isSubmitting || custodianLoading || !custodianId.trim()
                    }
                  >
                    {custodianLoading ? (
                      <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
                    ) : (
                      <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
                    )}
                  </button>
                </div>
                {custodianError && (
                  <span className="transfer-modal-error" role="alert">
                    {custodianError}
                  </span>
                )}
              </div>
            )}

            {/* custodian preview — only relevant in transfer mode */}
            {!isRemoveMode && custodian && (
              <div className="transfer-modal-preview">
                <FontAwesomeIcon icon="fa-solid fa-circle-check" />
                <div>
                  <p className="transfer-modal-preview-title">
                    {custodian.fullname}
                  </p>
                  <p className="transfer-modal-preview-sub">
                    {custodian.username || "—"} · {custodian.email || "—"}
                  </p>
                </div>
              </div>
            )}

            {/* notes */}
            <div className="transfer-modal-field">
              <label htmlFor="transfer-notes-input">Notes (optional)</label>
              <textarea
                id="transfer-notes-input"
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

            {/* Info box — copy + tone change based on mode */}
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
                  ? "This will unassign the asset from its current custodian. It will have no custodian until reassigned."
                  : "Find the asset and the receiving custodian first — both custodians will need to acknowledge the transfer before it's completed."}
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
                  : "Submit Transfer"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default TransferModal;
