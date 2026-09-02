import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import useRoomOverview from "../../../hooks/audit/useRoomOverview";
import AuditConfirmRoomModal from "../../../components/modal/AuditConfirmRoomModal";
import AuditCard from "../../../components/ui/card/audit/AuditCard";
import BackButton from "../../../components/ui/button/BackButton";
import useAuditRoomSession from "../../../hooks/audit/useAuditRoomSession";
import Table from "../../../components/panel/Table";
import AssetCard from "../../../components/ui/card/asset/AssetCard";
import DiscrepancyCard from "../../../components/ui/card/audit/DiscrepancyCard";
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
  const { handleCreateAudit } = useAuditRoomSession(roomID);

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

          <AuditConfirmRoomModal
            roomName={room?.name}
            onConfirm={handleCreateAudit}
            isEmpty={!totalAssets || totalAssets === 0}
          />
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
        <div className="audit-overview-table-wrap">
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
        <div className="audit-overview-table-wrap">
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
              <DiscrepancyCard
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
    </MainLayout>
  );
}

export default AuditRoomOverview;
