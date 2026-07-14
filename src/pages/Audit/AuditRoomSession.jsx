import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import useAuditSession from "../../hooks/audit/useAuditSession";
import AuditCard from "../../components/ui/card/AuditCard";
import AuditScanModal from "../../components/ui/modal/AuditScanModal";
import "./AuditRoomSession.css";

// == Local presentational helpers ==========================================

function StatusBadge({ isAudited, isMisplaced }) {
  if (isMisplaced) {
    return (
      <span className="audit-session-badge audit-session-badge--misplaced">
        <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
        Misplaced
      </span>
    );
  }

  if (isAudited) {
    return (
      <span className="audit-session-badge audit-session-badge--audited">
        <FontAwesomeIcon icon="fa-solid fa-circle-check" />
        Audited
      </span>
    );
  }

  return (
    <span className="audit-session-badge audit-session-badge--pending">
      Pending
    </span>
  );
}

function MarkAuditedButton({ asset, variant, onClick }) {
  if (asset.isAudited) return null;

  const className =
    variant === "card"
      ? "audit-session-mark-btn audit-session-mark-btn--card"
      : "audit-session-mark-btn";

  return (
    <button type="button" className={className} onClick={onClick}>
      Mark audited
    </button>
  );
}

function IncompleteAuditConfirm({
  auditedCount,
  totalAssets,
  onCancel,
  onConfirm,
}) {
  const remaining = totalAssets - auditedCount;

  return (
    <div className="audit-confirm-overlay">
      <div
        className="audit-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-confirm-title"
      >
        <FontAwesomeIcon
          icon="fa-solid fa-triangle-exclamation"
          className="audit-confirm-icon"
        />
        <h2 id="audit-confirm-title" className="audit-confirm-title">
          Audit isn't complete
        </h2>
        <p className="audit-confirm-detail">
          {remaining} of {totalAssets} assets {remaining === 1 ? "is" : "are"}{" "}
          still unaudited. Proceeding now will save this audit as incomplete.
        </p>

        <div className="audit-confirm-actions">
          <button
            type="button"
            className="audit-confirm-cancel"
            onClick={onCancel}
          >
            Go back
          </button>
          <button
            type="button"
            className="audit-confirm-proceed"
            onClick={onConfirm}
          >
            Proceed anyway
          </button>
        </div>
      </div>
    </div>
  );
}

// == Component ==============================================================

function AuditRoomSession() {
  const { auditID } = useParams();

  const {
    room,
    roomLoading,
    roomError,
    assetRows,
    assetsLoading,
    assetsError,
    totalAssets,
    auditedCount,
    progressPercent,
    validAssetIds,
    isAllAudited,
    handleScanAsset,
    handleAssetDetected,
    isCompleting,
    completeError,
    handleDiscard,
    handleProceed,
  } = useAuditSession(auditID);

  const [showIncompleteConfirm, setShowIncompleteConfirm] = useState(false);

  const hasAssets = !assetsLoading && assetRows.length > 0;

  const handleProceedClick = () => {
    if (!isAllAudited) {
      setShowIncompleteConfirm(true);
      return;
    }
    handleProceed();
  };

  const handleConfirmProceed = () => {
    setShowIncompleteConfirm(false);
    console.log("confirmed and proceeding..");
    handleProceed();
  };

  return (
    <MainLayout>
      <div className="audit-session-page">
        {/* Header */}
        <div className="audit-session-header">
          <div>
            <p className="audit-session-eyebrow">Audit session</p>
            <h1 className="audit-session-room-name">
              {roomLoading ? "Loading room…" : (room?.name ?? "Unknown room")}
            </h1>
            {roomError && (
              <p className="audit-session-error" role="alert">
                {roomError}
              </p>
            )}
          </div>

          <AuditScanModal
            onDetect={handleAssetDetected}
            validAssetIds={validAssetIds}
          />
        </div>

        {/* Stats */}
        <div className="audit-session-stats">
          <AuditCard
            variant="primary"
            label="Total assets"
            value={assetsLoading ? "—" : totalAssets}
          />

          <AuditCard
            variant="primary"
            label="Audited"
            value={assetsLoading ? "—" : auditedCount}
          />

          <AuditCard
            variant="progress"
            label="Progress"
            value={`${progressPercent}%`}
          >
            <div className="audit-card-progress-bar">
              <div
                className="audit-card-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </AuditCard>
        </div>

        {/* Asset list */}
        <div className="audit-session-table-wrap">
          {assetsError && (
            <p className="audit-session-error" role="alert">
              {assetsError}
            </p>
          )}

          {assetsLoading ? (
            <p className="audit-session-empty">Loading assets…</p>
          ) : !hasAssets ? (
            <p className="audit-session-empty">No assets found in this room.</p>
          ) : (
            <>
              {/* Desktop table */}
              <table className="audit-session-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Custodian</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {assetRows.map((asset) => (
                    <tr
                      key={asset.id}
                      className={
                        asset.isMisplaced
                          ? "audit-session-row--misplaced"
                          : asset.isAudited
                            ? "audit-session-row--audited"
                            : ""
                      }
                    >
                      <td>
                        <StatusBadge
                          isAudited={asset.isAudited}
                          isMisplaced={asset.isMisplaced}
                        />
                      </td>
                      <td>{asset.description || "—"}</td>
                      <td>{asset.category || "—"}</td>
                      <td>{asset.name || "—"}</td>
                      <td>
                        <MarkAuditedButton
                          asset={asset}
                          onClick={() => handleScanAsset(asset.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile card list */}
              <div className="audit-session-card-list">
                {assetRows.map((asset) => (
                  <div
                    key={asset.id}
                    className={`audit-session-card ${
                      asset.isMisplaced
                        ? "audit-session-card--misplaced"
                        : asset.isAudited
                          ? "audit-session-card--audited"
                          : ""
                    }`}
                  >
                    <div className="audit-session-card-top">
                      <StatusBadge
                        isAudited={asset.isAudited}
                        isMisplaced={asset.isMisplaced}
                      />
                    </div>

                    <p className="audit-session-card-title">
                      {asset.description || "—"}
                    </p>

                    <div className="audit-session-card-meta">
                      <div className="audit-session-card-meta-row">
                        <span className="audit-session-card-label">
                          Category
                        </span>
                        <span>{asset.category || "—"}</span>
                      </div>
                      <div className="audit-session-card-meta-row">
                        <span className="audit-session-card-label">
                          Custodian
                        </span>
                        <span>{asset.name || "—"}</span>
                      </div>
                    </div>

                    <MarkAuditedButton
                      asset={asset}
                      variant="card"
                      onClick={() => handleScanAsset(asset.id)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {completeError && (
          <p className="audit-session-error" role="alert">
            {completeError}
          </p>
        )}

        {/* Actions */}
        <div className="audit-session-actions">
          <button
            type="button"
            className="audit-session-leave-btn"
            onClick={handleDiscard}
            disabled={isCompleting}
          >
            Discard
          </button>

          <button
            type="button"
            className="audit-session-proceed-btn"
            onClick={handleProceedClick}
            disabled={isCompleting}
          >
            {isCompleting ? "Saving…" : "Proceed"}
          </button>
        </div>
      </div>

      {showIncompleteConfirm && (
        <IncompleteAuditConfirm
          auditedCount={auditedCount}
          totalAssets={totalAssets}
          onCancel={() => setShowIncompleteConfirm(false)}
          onConfirm={handleConfirmProceed}
        />
      )}
    </MainLayout>
  );
}

export default AuditRoomSession;
