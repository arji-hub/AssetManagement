import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuditRoom } from "../../hooks/audit/useAuditRoom";
import "./AuditRoom.css";

function AuditRoom() {
  const { lastEntry, handleClick } = useAuditRoom();

  return (
    <button className="audit-panel-card" onClick={handleClick} type="button">
      <div className="audit-panel-icon">
        <FontAwesomeIcon icon="door-open" aria-hidden="true" />
      </div>
      <h4 className="audit-panel-title">Audit Assets per Room</h4>
      <p className="audit-panel-desc">
        Verify physical assets against system records by room and laboratory
        locations.
      </p>
      <div className="audit-panel-footer">
        <span className="audit-panel-badge audit-panel-badge--danger">
          {lastEntry ? `Last entry: ${lastEntry}` : "No recent entries"}
        </span>
        <FontAwesomeIcon
          icon="arrow-right"
          className="audit-panel-arrow"
          aria-hidden="true"
        />
      </div>
    </button>
  );
}

export default AuditRoom;
