import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./AuditReport.css";

function AuditReport() {
  const navigate = useNavigate();
  const lastEntry = "2 hours ago";
  function handleClick() {
    navigate("/audit/report");
  }
  return (
    <button className="audit-panel-card" onClick={handleClick} type="button">
      <div className="audit-panel-icon">
        <FontAwesomeIcon icon="clipboard-check" aria-hidden="true" />
      </div>
      <h4 className="audit-panel-title">Report Logs</h4>
      <p className="audit-panel-desc">
        View detailed audit report activity, filtered by date range and
        personnel.
      </p>
      <div className="audit-panel-footer">
        <span className="audit-panel-badge audit-panel-badge--neutral">
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

export default AuditReport;
