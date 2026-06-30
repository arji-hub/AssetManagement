// components/modal/TransferRoomModal.jsx

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTransferRoomRequest from "../../../hooks/useTransferRoomRequest";
import "./TransferRoomModal.css";
import AddingStatusModal from "../status/AddingStatusModal";

function TransferRoomModal({ onClose, assetID = "" }) {
  const {
    assetInputRef,
    assetId,
    asset,
    assetLoading,
    assetError,
    rooms,
    roomsLoading,
    roomsError,
    moveTo,
    submitError,
    isSubmitting,
    isFormValid,
    setAssetId,
    setMoveTo,
    handleFindAsset,
    handleAssetIdKeyDown,
    handleSubmit,
    submitStatus,
    handleStatusClose,
  } = useTransferRoomRequest({ onClose, assetID });

  return (
    <>
      {submitStatus && (
        <AddingStatusModal
          title="Move Asset"
          status={submitStatus}
          errorMessage={submitError}
          onClose={handleStatusClose}
        />
      )}
      <div className="transfer-room-modal-overlay">
        <div
          className="transfer-room-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-room-modal-title"
        >
          {/* Header */}
          <div className="transfer-room-modal-header">
            <h2 id="transfer-room-modal-title">Move Asset</h2>
            <button
              className="transfer-room-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div className="transfer-room-modal-body">
            {/* asset id lookup */}
            <div
              className={`transfer-room-modal-field ${assetError ? "has-error" : ""}`}
            >
              <label htmlFor="transfer-room-asset-id-input">Asset ID</label>
              <div className="transfer-room-modal-lookup">
                <input
                  id="transfer-room-asset-id-input"
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
                  className="transfer-room-modal-find-btn"
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
                <span className="transfer-room-modal-error" role="alert">
                  {assetError}
                </span>
              )}
            </div>

            {/* asset preview */}
            {asset && (
              <div className="transfer-room-modal-preview">
                <FontAwesomeIcon icon="fa-solid fa-circle-check" />
                <div>
                  <p className="transfer-room-modal-preview-title">
                    {asset.description || asset.id}
                  </p>
                  <p className="transfer-room-modal-preview-sub">
                    Currently in {asset.room_id || "—"}
                  </p>
                </div>
              </div>
            )}

            {/* destination room dropdown */}
            <div
              className={`transfer-room-modal-field ${roomsError ? "has-error" : ""}`}
            >
              <label htmlFor="transfer-room-destination-select">
                Move To
              </label>
              <select
                id="transfer-room-destination-select"
                value={moveTo}
                onChange={(e) => setMoveTo(e.target.value)}
                disabled={isSubmitting || roomsLoading || !asset}
              >
                <option value="" disabled>
                  {roomsLoading ? "Loading rooms..." : "Select a room"}
                </option>
                {rooms.map((room) => (
                  <option key={room.id || room} value={room.id || room}>
                    {room.name || room}
                  </option>
                ))}
              </select>
              {roomsError && (
                <span className="transfer-room-modal-error" role="alert">
                  {roomsError}
                </span>
              )}
            </div>

            {submitError && (
              <div className="transfer-room-modal-submit-error" role="alert">
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
                Find the asset first, then select the room you want to move
                it to. This action is recorded immediately and cannot be
                edited afterward.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="transfer-room-modal-footer">
            <button
              className="transfer-room-modal-btn transfer-room-modal-btn--cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="transfer-room-modal-btn transfer-room-modal-btn--submit"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? "Moving..." : "Move Asset"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default TransferRoomModal;