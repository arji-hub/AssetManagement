import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../../components/layout/MainLayout";
import useRoomInfo from "../../../hooks/audit/useRoomInfo";
import AuditCard from "../../../components/ui/card/audit/AuditCard";
import { useParams } from "react-router-dom";
import BackButton from "../../../components/ui/button/BackButton";
import { formatDate } from "../../../utils/date";
import Camera from "../../../components/camera/Camera";
import ScanStatusModal from "../../../components/ui/status/scanStatusModal";
import { AuditRoomPDF } from "../../../pdf/templates/AuditRoomPDF";
import { PDFPreviewModal } from "../../../components/modal/PDFPreviewModal";
import AuditSaveRoomModal from "../../../components/modal/AuditSaveRoomModal";
import useAuditRoomPDF from "../../../hooks/audit/useAuditRoomPDF";
import Table from "../../../components/panel/Table";
import AuditItemCard from "../../../components/ui/card/audit/AuditItemCard";
import DiscrepancyItemCard from "../../../components/ui/card/audit/DiscrepancyItemCard";
import {
  getAuditItemColumns,
  discrepancyItemColumns,
} from "../../../data/columns/auditColumns";
import "./AuditRoomInfo.css";

function DiscrepancyBanner({ hasDiscrepancies, discrepancyCount }) {
  if (!hasDiscrepancies) return null;

  return (
    <div className="audit-session-discrepancy-banner" role="alert">
      <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
      {discrepancyCount} discrepanc{discrepancyCount === 1 ? "y" : "ies"} found
      in this audit
    </div>
  );
}

function AuditRoomInfo() {
  const { auditID } = useParams();
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const {
    audit,
    auditItems,
    loading,
    error,
    totalAssets,
    progressPercent,
    roomName,
    topCustodian,
    verifyingId,
    hasItems,
    handleVerifyItem,
    handleScan,
    isCameraOpen,
    setIsCameraOpen,
    scanModalOpen,
    scanModalError,
    scanModalStatus,
    scannedItem,
    handleScanModalClose,
    handleCameraClose,
    handleAddDiscrepancy,
    discrepancyItems,
    addingDiscrepancy,
    completingAudit,
    completeAuditError,
    handleCompleteAudit,
    handleRowClick,
  } = useRoomInfo(auditID);

  const { auditPDF, auditItemsPDF } = useAuditRoomPDF(auditID);

  const isCompleted = audit?.status === "completed";

  const auditItemColumns = useMemo(
    () =>
      getAuditItemColumns({
        verifyingId,
        isCompleted,
        onVerify: handleVerifyItem,
      }),
    [verifyingId, isCompleted, handleVerifyItem],
  );

  return (
    <MainLayout>
      <div className="audit-session-page">
        {/* Header */}
        <div className="audit-session-header">
          <div className="audit-session-header-left">
            <BackButton className="audit-session-back-btn" />

            <div className="audit-session-title-group">
              <span className="audit-session-eyebrow">Audit Session</span>
              <h1 className="audit-session-room-name">
                {loading ? "Loading audit…" : (roomName ?? "Unknown audit")}
              </h1>
              {error && (
                <p className="audit-session-error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="audit-session-header-right">
            {!isCompleted && (
              <button
                type="button"
                className="audit-camera-scan"
                onClick={() => setIsCameraOpen(true)}
              >
                <FontAwesomeIcon icon="fa-solid fa-camera" />
                Scan Asset
              </button>
            )}

            {isCompleted && (
              <PDFPreviewModal
                title="Audit Report"
                fileName={`audit-report-${auditID}.pdf`}
                document={
                  <AuditRoomPDF
                    roomName={roomName}
                    audit={auditPDF}
                    items={auditItemsPDF}
                  />
                }
                triggerLabel="View Audit Report"
              />
            )}

            <button
              type="button"
              className="audit-session-save-btn"
              onClick={() => setIsSaveConfirmOpen(true)}
              disabled={isCompleted || completingAudit || loading || !hasItems}
              title={
                isCompleted
                  ? "Audit already completed"
                  : "Save and mark this audit as complete"
              }
            >
              {completingAudit ? (
                <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
              ) : (
                <FontAwesomeIcon icon="fa-solid fa-check" />
              )}
              {isCompleted ? "Completed" : "Complete Audit"}
            </button>
          </div>
        </div>

        {completeAuditError && (
          <p className="audit-session-error" role="alert">
            {completeAuditError}
          </p>
        )}

        {/* Discrepancy banner */}
        {audit && (
          <DiscrepancyBanner
            hasDiscrepancies={audit.has_discrepancies}
            discrepancyCount={audit.discrepancy_count}
          />
        )}

        {/* Stats */}
        <div className="audit-session-stats">
          <AuditCard
            variant="primary"
            label="Total assets"
            value={loading ? "—" : totalAssets}
          />

          <AuditCard
            variant="primary"
            label="Audited"
            value={loading ? "—" : audit?.audited_count}
          />

          <AuditCard
            variant="primary"
            label="Discrepancies"
            value={loading ? "—" : audit?.discrepancy_count}
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

        {/* Audit meta */}
        <div className="audit-session-table-wrap">
          <h3 className="audit-session-section-title">Audit details</h3>
          <div className="audit-session-meta-grid">
            <div className="audit-session-meta-row">
              <span className="audit-session-card-label">Audit No.</span>
              <span>{audit?.audit_no || "—"}</span>
            </div>

            <div className="audit-session-meta-row">
              <span className="audit-session-card-label">Conducted by</span>
              <span>{audit?.audited_by_name || "—"}</span>
            </div>

            <div className="audit-session-meta-row">
              <span className="audit-session-card-label">Room Custodian</span>
              <span>{topCustodian ? `${topCustodian.name}` : "—"}</span>
            </div>

            <div className="audit-session-meta-row">
              <span className="audit-session-card-label">Date</span>
              <span>
                {audit?.created_at ? formatDate(audit.created_at) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Audit items */}
        <div className="audit-session-table-wrap">
          <h3 className="audit-session-section-title">Audit items</h3>

          {error && (
            <p className="audit-session-error" role="alert">
              {error}
            </p>
          )}

          <Table
            columns={auditItemColumns}
            items={auditItems}
            loading={loading}
            error={error}
            itemLabel="items"
            emptyMessage="No audit items recorded yet."
            emptyIcon="fa-solid fa-clipboard"
            desktopPageSize={20}
            mobilePageSize={10}
            renderItem={(item, index) => (
              <AuditItemCard
                key={item.id}
                item={item}
                index={index}
                columns={auditItemColumns}
                onRowClick={handleRowClick}
              />
            )}
          />
        </div>

        {/* Discrepancy items */}
        {discrepancyItems.length > 0 && (
          <div className="audit-session-table-wrap">
            <h3 className="audit-session-section-title audit-session-section-title--discrepancy">
              Discrepancies
            </h3>

            <Table
              columns={discrepancyItemColumns}
              items={discrepancyItems}
              loading={false}
              error={null}
              itemLabel="discrepancies"
              emptyMessage="No discrepancies found."
              emptyIcon="fa-solid fa-triangle-exclamation"
              desktopPageSize={20}
              mobilePageSize={10}
              renderItem={(item, index) => (
                <DiscrepancyItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  columns={discrepancyItemColumns}
                />
              )}
            />
          </div>
        )}

        {/* Camera modal */}
        <Camera
          isOpen={isCameraOpen}
          onScan={handleScan}
          onClose={handleCameraClose}
        />

        <AuditSaveRoomModal
          isOpen={isSaveConfirmOpen}
          onClose={() => setIsSaveConfirmOpen(false)}
          onConfirm={handleCompleteAudit}
          roomName={roomName}
          auditedCount={audit?.audited_count ?? 0}
          totalAssets={totalAssets}
          discrepancyCount={audit?.discrepancy_count ?? 0}
        />

        {/* Scan status modal - Shows scanned item details */}
        {scanModalOpen && (
          <ScanStatusModal
            item={scannedItem}
            status={scanModalStatus}
            errorMessage={scanModalError}
            onAddDiscrepancy={handleAddDiscrepancy}
            addingDiscrepancy={addingDiscrepancy}
            onClose={handleScanModalClose}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default AuditRoomInfo;
