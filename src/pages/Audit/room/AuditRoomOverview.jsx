import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardCheck } from "@fortawesome/free-solid-svg-icons";
import { PDFPreviewModal } from "../../../components/modal/PDFPreviewModal";
import { RoomInventoryPDF } from "../../../pdf/templates/RoomInventoryPDF";
import useRoomOverview from "../../../hooks/audit/room/useRoomOverview";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import AuditCard from "../../../components/ui/card/audit/AuditCard";
import BackButton from "../../../components/ui/button/BackButton";
import useAuditRoomSession from "../../../hooks/audit/room/useAuditRoomSession";
import Table from "../../../components/panel/Table";
import AssetCard from "../../../components/ui/card/asset/AssetCard";
import PreviousAuditCard from "../../../components/ui/card/audit/PreviousAuditCard";
import AddingStatusModal from "../../../components/ui/status/AddingStatusModal";
import {
  auditRoomAssetColumns,
  auditHistoryColumns,
} from "../../../data/columns/auditColumns";
import { formatDate } from "../../../utils/date";
import "./AuditRoomOverview.css";

function AuditRoomOverview() {
  const navigate = useNavigate();
  const { roomID } = useParams();

  const {
    room,
    roomLoading,
    roomError,
    assets,
    assetsLoading,
    assetsError,
    totalAssets,
    topCustodian,
    previousAudits,
    auditsLoading,
    auditsError,
    lastAuditedAt,
  } = useRoomOverview(roomID);
  const {
    handleCreateAudit,
    handleStatusClose,
    addStatus,
    addError,
    addErrorTitle,
  } = useAuditRoomSession(roomID);
  const ongoingAudit = previousAudits?.find((a) => !a.completed_at);
  const isEmpty = !totalAssets || totalAssets === 0;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <MainLayout>
      <div className="audit-overview-page">
        {/* Header */}
        <div className="audit-overview-header">
          <div className="audit-overview-header-left">
            <BackButton className="audit-overview-back-btn" />

            <div className="audit-overview-title-group">
              <p className="audit-overview-eyebrow">Room overview</p>
              <h1 className="audit-overview-room-name">
                {roomLoading ? "Loading room…" : (room?.name ?? "Unknown room")}
              </h1>
              {roomError && (
                <p className="audit-overview-error" role="alert">
                  {roomError}
                </p>
              )}
            </div>
          </div>

          <div className="audit-overview-header-actions">
            {!isEmpty && (
              <PDFPreviewModal
                title="Inventory Form"
                fileName={`room-inventory-${room?.name ?? roomID}.pdf`}
                document={
                  <RoomInventoryPDF roomName={room?.name} assets={assets} />
                }
                triggerLabel={
                  <>
                    <FontAwesomeIcon icon="fa-solid fa-file-pdf" />
                    Room Inventory Form
                  </>
                }
              />
            )}

            {auditsLoading ? null : ongoingAudit ? (
              <button
                type="button"
                className="audit-overview-scan-btn"
                onClick={() =>
                  navigate(`/audit/room/${roomID}/${ongoingAudit.id}`)
                }
              >
                <FontAwesomeIcon
                  icon="fa-solid fa-list-check"
                  aria-hidden="true"
                />
                View ongoing audit
              </button>
            ) : (
              <button
                type="button"
                className="audit-overview-scan-btn"
                onClick={() => setIsConfirmOpen(true)}
              >
                <FontAwesomeIcon icon={faClipboardCheck} aria-hidden="true" />
                Create new audit
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="audit-overview-stats">
          <AuditCard
            variant="primary"
            icon="fa-solid fa-boxes-stacked"
            label="Total assets"
            value={assetsLoading ? "—" : totalAssets}
            hint="Registered to this room"
          />

          <AuditCard
            variant="secondary"
            icon="fa-solid fa-user-shield"
            label="Room custodian"
            value={
              assetsLoading
                ? "—"
                : topCustodian
                  ? topCustodian.name
                  : "Unassigned"
            }
            hint={
              !assetsLoading && topCustodian
                ? `Holds ${topCustodian.count} of ${totalAssets} assets`
                : null
            }
          />

          <AuditCard
            variant="neutral"
            icon="fa-solid fa-calendar-check"
            label="Last audited"
            value={
              auditsLoading
                ? "—"
                : lastAuditedAt
                  ? formatDate(lastAuditedAt)
                  : "Never"
            }
            hint={
              !auditsLoading && previousAudits.length > 0
                ? `${previousAudits.length} audit${previousAudits.length === 1 ? "" : "s"} conducted`
                : null
            }
          />
        </div>

        {/* Asset list */}
        <div className="audit-overview-table-wrap audit-overview-assets-wrap">
          <h3 className="audit-overview-section-title">Assets in this room</h3>

          {assetsError && (
            <p className="audit-overview-error" role="alert">
              {assetsError}
            </p>
          )}

          <Table
            columns={auditRoomAssetColumns}
            items={assets}
            loading={assetsLoading}
            error={assetsError}
            itemLabel="assets"
            emptyMessage="No assets found in this room."
            emptyIcon="fa-solid fa-box-open"
            desktopPageSize={20}
            mobilePageSize={10}
            renderItem={(asset, index) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                index={index}
                columns={auditRoomAssetColumns}
              />
            )}
          />
        </div>

        {/* Previous audits */}
        <div className="audit-overview-table-wrap audit-overview-audits-wrap">
          <h3 className="audit-overview-section-title">Previous audits</h3>

          {auditsError && (
            <p className="audit-overview-error" role="alert">
              {auditsError}
            </p>
          )}

          <Table
            columns={auditHistoryColumns}
            items={previousAudits}
            loading={auditsLoading}
            error={auditsError}
            itemLabel="audits"
            emptyMessage="No audits conducted yet."
            emptyIcon="fa-solid fa-clock-rotate-left"
            desktopPageSize={20}
            mobilePageSize={10}
            renderItem={(audit, index) => (
              <PreviousAuditCard
                key={audit.id}
                audit={audit}
                index={index}
                columns={auditHistoryColumns}
                roomID={roomID}
              />
            )}
          />
        </div>
      </div>
      {!auditsLoading && !ongoingAudit && (
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleCreateAudit}
          title={isEmpty ? "No assets to audit" : "Start a new audit?"}
          infoOnly={isEmpty}
          closeLabel="Return"
        >
          {isEmpty ? (
            <p>
              This room{room?.name ? ` (${room.name})` : ""} has no assets yet.
              Add assets to this room before starting an audit.
            </p>
          ) : (
            <p>
              This will begin a new audit session
              {room?.name ? ` for ${room.name}` : ""}. Make sure any audit
              currently in progress for this room has been completed first.
            </p>
          )}
        </ConfirmModal>
      )}
      {addStatus && (
        <AddingStatusModal
          title="Audit"
          status={addStatus}
          errorTitle={addErrorTitle}
          errorMessage={addError}
          onClose={handleStatusClose}
        />
      )}
    </MainLayout>
  );
}

export default AuditRoomOverview;
