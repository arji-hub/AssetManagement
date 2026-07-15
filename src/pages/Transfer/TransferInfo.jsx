import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import { Status } from "../../components/ui/status/assetStatus";
import { formatDate } from "../../utils/date";
import AckBadge from "../../components/ui/card/AckBadge";
import TransferLogEntry from "../../components/ui/card/TransferLogEntry";
import { useTransferInfo } from "../../hooks/transfer/useTransferInfo";
import TransferActionModal from "../../components/ui/modal/TransferActionModal";
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
  } = useTransferInfo();

  if (loading) return <MainLayout></MainLayout>;

  if (error)
    return (
      <MainLayout>
        <div className="transfer-info-error">{error}</div>
      </MainLayout>
    );

  const actionTitle = actionModal === "approve" ? "Approval" : "Decline";
  const isLocalMRType =
    request?.type === TRANSFER_TYPES.ASSIGNMR ||
    request?.type === TRANSFER_TYPES.REMOVEMR;
  const fromLabel = isLocalMRType ? "CUSTODIAN" : "TRANSFER FROM";
  const toLabel = isLocalMRType ? "LOCAL MR" : "TRANSFER TO";
  const ackFromLabel = isLocalMRType ? "Custodian" : "From";
  const ackToLabel = isLocalMRType ? "Local MR" : "To";
  return (
    <MainLayout>
      <div className="transfer-info-page">
        {/* ── Header ── */}
        <div className="asset-info-header">
          <div className="asset-info-breadcrumb">
            <BackButton />
            <span className="breadcrumb-parent">Transfer Request</span>
          </div>
          {/* ── Actions ── */}
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

        {/* ── Main Card ── */}
        <div className="transfer-info-card">
          <div className="transfer-info-card-header">
            <div className="transfer-info-card-header-left">
              <span className="transfer-info-type-label">{typeLabel}</span>
              <h2 className="transfer-info-asset-name">
                {request.asset_description}
              </h2>
              <p className="transfer-info-asset-id">{request.asset_id}</p>
            </div>
            <div className="transfer-info-card-header-right">
              <Status status={request.status} />
              <span className="transfer-info-date">
                {formatDate(request.created_at)}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="transfer-info-details">
            <div className="transfer-info-detail-box">
              <span className="transfer-info-field-label">REQUESTED BY</span>
              <p className="transfer-info-field-value transfer-info-field-value--upper">
                {request.requested_by_name || "—"}
              </p>
            </div>

            <div className="transfer-info-detail-box">
              <span className="transfer-info-field-label">TYPE</span>
              <p className="transfer-info-field-value">{typeLabel || "—"}</p>
            </div>

            <div className="transfer-info-detail-box">
              <span className="transfer-info-field-label">{fromLabel}</span>
              <p className="transfer-info-field-value">
                {ackFrom?.name || (
                  <em className="transfer-info-unassigned">Unallocated</em>
                )}
              </p>
            </div>

            <div className="transfer-info-detail-box">
              <span className="transfer-info-field-label">{toLabel}</span>
              <p className="transfer-info-field-value">
                {ackTo?.name || (
                  <em className="transfer-info-unassigned">Unallocated</em>
                )}
              </p>
            </div>

            {request.completed_at && (
              <div className="transfer-info-detail-box">
                <span className="transfer-info-field-label">COMPLETED AT</span>
                <p className="transfer-info-field-value">
                  {formatDate(request.completed_at)}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {request.notes && (
            <div className="transfer-info-section">
              <span className="transfer-info-section-label">
                REASON/S FOR TRANSFER
              </span>
              <p className="transfer-info-notes">{request.notes}</p>
            </div>
          )}

          {/* Acknowledgments */}
          {request.acknowledgments && (
            <div className="transfer-info-section">
              <span className="transfer-info-section-label">
                ACKNOWLEDGMENTS
              </span>
              <div className="transfer-info-ack-row">
                {ackAdmin && <AckBadge label="Admin" ack={ackAdmin} />}
                {ackFrom && <AckBadge label={ackFromLabel} ack={ackFrom} />}
                {ackTo && <AckBadge label={ackToLabel} ack={ackTo} />}
              </div>
            </div>
          )}
        </div>

        {/* ── Status Log ── */}
        <div className="transfer-log-card">
          <span className="transfer-info-section-label">STATUS HISTORY</span>
          <div className="transfer-info-log">
            {request.status_log?.map((log, index) => (
              <TransferLogEntry key={index} log={log} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default TransferInfo;
