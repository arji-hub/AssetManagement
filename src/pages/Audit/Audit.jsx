// src/pages/Audit/Audit.jsx
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { displayDate } from "../../utils/date";
import AuditPanel from "../../components/panel/AuditPanel";
import { useAuditRoom } from "../../hooks/audit/room/useAuditRoom";
import { useReport } from "../../hooks/audit/incident/useReport";
import useCustodianLogs from "../../hooks/audit/custodian/useCustodianLogs";
import "./Audit.css";

function Audit() {
  const navigate = useNavigate();

  const { lastEntry: roomLastEntry, handleClick: handleRoomClick } =
    useAuditRoom();
  const { lastEntry: incidentLastEntry, handleClick: handleIncidentClick } =
    useReport();
  const { custodians } = useCustodianLogs();

  const handleCustodianClick = () => navigate("/audit/custodian");

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
          <AuditPanel
            icon="door-open"
            title="Room Logs"
            description="View the history of asset movements and status changes recorded per room."
            lastEntry={roomLastEntry}
            entryLabel="Last entry"
            badgeVariant="neutral"
            onClick={handleRoomClick}
          />
          <AuditPanel
            icon="clipboard-check"
            title="Incident Logs"
            description="View detailed audit report activity, filtered by date range and personnel."
            lastEntry={incidentLastEntry}
            entryLabel="Last entry"
            badgeVariant="neutral"
            onClick={handleIncidentClick}
          />
          <AuditPanel
            icon="users"
            title="Custodian Logs"
            description="View asset custody records and accountability by custodian."
            lastEntry={custodians.length}
            entryLabel="Total custodians:"
            badgeVariant="danger"
            onClick={handleCustodianClick}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default Audit;
