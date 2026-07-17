import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import NewAuditRoomModal from "../../components/ui/modal/NewAuditRoomModal";
import AuditCard from "../../components/ui/card/AuditCard";
import AuditHistory from "../../components/panel/AuditHistory";
import BackButton from "../../components/ui/button/BackButton";
import useRoomLogs from "../../hooks/audit/useRoomLogs";
import "./AuditRoom.css";

function AuditRoom() {
  const {
    filteredLogs,
    logsLoading,
    logsError,
    search,
    setSearch,
    stats,
    handleLogAction,
    handleHistoryRowClick,
  } = useRoomLogs();
  return (
    <MainLayout>
      <div className="audit-room-page">
        <div className="audit-room-header">
          <div className="audit-room-header-left">
            <BackButton nav="/audit" />
            <div>
              <h2 className="audit-room-title">Audit Room Logs</h2>
              <p className="audit-room-subtitle">
                View historical records and current status of institutional
                space audits.
              </p>
            </div>
          </div>

          <div className="audit-room-header-actions">
            <NewAuditRoomModal />
          </div>
        </div>

        <div className="audit-room-stats">
          <AuditCard
            variant="secondary"
            label="Total audits"
            value={logsLoading ? "—" : stats.totalAudits}
          />
          <AuditCard
            variant="primary"
            label="Rooms pending"
            value={logsLoading ? "—" : stats.roomsPending}
          />
          <AuditCard
            variant="neutral"
            label="Avg. discrepancy rate"
            value={logsLoading ? "—" : `${stats.avgDiscrepancyRate}%`}
          />
        </div>

        <div className="audit-room-filter">
          <div className="audit-room-search">
            <FontAwesomeIcon
              icon="magnifying-glass"
              className="audit-room-search-icon"
            />
            <input
              type="text"
              placeholder="Search logs by room or auditor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="audit-room-btn-secondary" type="button">
            <FontAwesomeIcon icon="fa-solid fa-sliders" />
            Filter
          </button>
        </div>

        {logsError && (
          <p className="audit-room-error" role="alert">
            {logsError}
          </p>
        )}

        <AuditHistory
          sessions={filteredLogs}
          onLogAction={handleLogAction}
          handleRowClick={handleHistoryRowClick}
        />
      </div>
    </MainLayout>
  );
}

export default AuditRoom;
