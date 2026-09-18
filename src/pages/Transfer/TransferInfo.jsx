import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import { Status } from "../../components/ui/status/assetStatus";
import { formatDate } from "../../utils/date";
import AckBadge from "../../components/ui/card/transfer/AckBadge";
import TransferLogEntry from "../../components/ui/card/transfer/TransferLogEntry";
import { useTransferInfo } from "../../hooks/transfer/useTransferInfo";
import { getRequestItems } from "../../services/transfer";
import TransferActionModal from "../../components/modal/TransferActionModal";
import AddingStatusModal from "../../components/ui/status/AddingStatusModal";
import { TRANSFER_TYPES } from "../../data/transfer";
import "./TransferInfo.css";
import BackButton from "../../components/ui/button/BackButton";

function TransferInfo() {
  const navigate = useNavigate();
  const {
    request,
    loading,
    error,
    typeLabel,
    ackAdmin,
    ackFrom,
    ackTo,
    showActions,
    actionModal,
    setActionModal,
    submitStatus,
    submitError,
    handleSubmitAction,
    closeActionFlow,
    handleAssetClick,
  } = useTransferInfo();

  if (loading) return <MainLayout></MainLayout>;

  if (error)
    return (
      <MainLayout>
        <div className="transfer-info-error">{error}</div>
      </MainLayout>
    );

  const actionTitle = actionModal === "approve" ? "Approval" : "Decline";
  const items = getRequestItems(request);
  const isSingleAsset = items.length === 1;
  const isLocalMRType =
    request?.type === TRANSFER_TYPES.ASSIGNMR ||
    request?.type === TRANSFER_TYPES.REMOVEMR;
  const fromLabel = isLocalMRType ? "Custodian" : "Transfer from";
  const toLabel = isLocalMRType ? "Local MR" : "Transfer to";
  const ackFromLabel = isLocalMRType ? "Custodian" : "From";
  const ackToLabel = isLocalMRType ? "Local MR" : "To";

  return (
    <MainLayout>
      <div className="transfer-info-page">
        {/* ── Top bar ── */}
        <div className="transfer-info-topbar">
          <div className="transfer-info-breadcrumb">
            <BackButton />
            <span>Transfer Request</span>
          </div>

          {showActions && (
            <div className="transfer-info-actions">
              <button
                className="transfer-action-btn--decline"
                onClick={() => setActionModal("decline")}
              >
                <FontAwesomeIcon icon="fa-solid fa-xmark" />
                Decline
              </button>
              <button
                className="transfer-action-btn--approve"
                onClick={() => setActionModal("approve")}
              >
                <FontAwesomeIcon icon="fa-solid fa-check" />
                Approve
              </button>
            </div>
          )}
        </div>

        {actionModal && !submitStatus && (
          <TransferActionModal
            type={actionModal}
            onClose={() => setActionModal(null)}
            onConfirm={(remarks) => {
              handleSubmitAction(remarks);
            }}
          />
        )}

        {submitStatus && (
          <AddingStatusModal
            title={actionTitle}
            status={submitStatus}
            errorMessage={submitError}
            onClose={closeActionFlow}
          />
        )}

        {/* ── Main card ── */}
        <div className="transfer-info-card">
          {/* Hero */}
          <div className="transfer-info-hero">
            <div className="transfer-info-hero-main">
              <span className="transfer-info-type-pill">{typeLabel}</span>
              <h1 className="transfer-info-asset-name">
                {isSingleAsset
                  ? items[0]?.asset_description
                  : `${items.length} assets`}
              </h1>
              <p className="transfer-info-asset-id">
                {isSingleAsset
                  ? items[0]?.asset_id
                  : `${items.length} items in this request`}
              </p>
            </div>

            <div className="transfer-info-hero-meta">
              <Status status={request.status} />
              <span className="transfer-info-date">
                {formatDate(request.created_at)}
              </span>
            </div>
          </div>

          {/* Meta strip */}
          <div className="transfer-info-meta-strip">
            <div className="transfer-info-meta-item">
              <span className="transfer-info-meta-label">Requested by</span>
              <span className="transfer-info-meta-value">
                {request.requested_by_name || "—"}
              </span>
            </div>

            <div className="transfer-info-meta-item">
              <span className="transfer-info-meta-label">{fromLabel}</span>
              <span className="transfer-info-meta-value">
                {ackFrom?.name || (
                  <em className="transfer-info-unassigned">Unallocated</em>
                )}
              </span>
            </div>

            <div className="transfer-info-meta-item">
              <span className="transfer-info-meta-label">{toLabel}</span>
              <span className="transfer-info-meta-value">
                {ackTo?.name || (
                  <em className="transfer-info-unassigned">Unallocated</em>
                )}
              </span>
            </div>

            {request.completed_at && (
              <div className="transfer-info-meta-item">
                <span className="transfer-info-meta-label">Completed at</span>
                <span className="transfer-info-meta-value">
                  {formatDate(request.completed_at)}
                </span>
              </div>
            )}
          </div>

          {/* Assets in this request */}
          {items.length > 0 && (
            <div className="transfer-info-section">
              <span className="transfer-info-section-label">
                Assets · {items.length}
              </span>
              <div className="transfer-info-items-list">
                {items.map((item) => (
                  <div
                    className="transfer-info-item-row"
                    key={item.asset_id}
                    onClick={() => handleAssetClick(item.asset_id)}
                  >
                    <span className="transfer-info-item-desc">
                      {item.asset_description}
                    </span>
                    <span className="transfer-info-item-id">
                      {item.asset_id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {request.notes && (
            <div className="transfer-info-section">
              <span className="transfer-info-section-label">
                Reason for transfer
              </span>
              <p className="transfer-info-notes">{request.notes}</p>
            </div>
          )}

          {/* Acknowledgments */}
          {request.acknowledgments && (
            <div className="transfer-info-section">
              <span className="transfer-info-section-label">
                Acknowledgments
              </span>
              <div className="transfer-info-ack-row">
                {ackAdmin && <AckBadge label="Admin" ack={ackAdmin} />}
                {ackFrom && <AckBadge label={ackFromLabel} ack={ackFrom} />}
                {ackTo && <AckBadge label={ackToLabel} ack={ackTo} />}
              </div>
            </div>
          )}
        </div>

        {/* ── Status log ── */}
        <div className="transfer-log-card">
          <span className="transfer-info-section-label">Status history</span>
          <div className="transfer-info-log">
            {request.status_log
              ?.slice()
              .reverse()
              .map((log, index) => (
                <TransferLogEntry key={index} log={log} />
              ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default TransferInfo;
