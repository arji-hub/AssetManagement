import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import { displayDate } from "../../utils/date";
import AuditRoom from "../../components/panel/AuditRoom";
import AuditReport from "../../components/panel/AuditReport";
import AuditHistory from "../../components/panel/AuditHistory";
import useReportLog from "../../hooks/audit/useReportLog";
import useRoomLogs from "../../hooks/audit/useRoomLogs";
import "./Audit.css";

function Audit() {
  const { user } = useAuth();

  const { filteredLogs: reportLogs, handleRowClick: handleReportRowClick } =
    useReportLog();
  const {
    filteredLogs: auditLogs,
    handleHistoryRowClick: handleAuditRowClick,
  } = useRoomLogs();

  return (
    <MainLayout>
      <div className="audit-page">
        <div className="audit-header">
          <div>
            <h2 className="title">Audit</h2>
            <p className="date">{displayDate}</p>
          </div>
          <p className="audit-subtitle">
            Institutional resource verification and tracking
          </p>
        </div>

        <div className="audit-panels">
          <AuditRoom />
          <AuditReport />
        </div>

        <AuditHistory
          reportLogs={reportLogs}
          auditLogs={auditLogs}
          onReportClick={handleReportRowClick}
          onAuditClick={handleAuditRowClick}
        />
      </div>
    </MainLayout>
  );
}

export default Audit;
