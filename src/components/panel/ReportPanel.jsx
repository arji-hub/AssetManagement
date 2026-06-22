import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReportCard from "../ui/card/ReportCard";
import { MOCK_REPORTS, STATUS_GROUPS, COLUMNS } from "../../data/reports";
import { getReportType } from "../../utils/report";
import "./ReportPanel.css";

function ReportPanel({
  group = "incident",
  statusFilter = ["damaged", "missing"],
}) {
  const navigate = useNavigate();

  const [reports] = useState(MOCK_REPORTS);
  const [loading] = useState(false);
  const [error] = useState(null);

  const allowedStatuses = STATUS_GROUPS[group] || [];

  const filteredReports = (reports || []).filter((r) => {
    const statusMatch = allowedStatuses.includes(r.status);
    return statusMatch;
  });

  const handleRowClick = (report) => {
    navigate(`/report/${report.id}`);
  };

  return (
    <div className={`report-panel ${group}`}>
      <div className="report-panel-header">
        {COLUMNS[group].map((col) => (
          <div key={col} className="report-panel-header-cell">
            {col}
          </div>
        ))}
      </div>

      <div className="report-panel-body">
        {loading ? (
          <div className="report-panel-empty">
            <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
            <p>Loading reports…</p>
          </div>
        ) : error ? (
          <div className="report-panel-empty">
            <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
            <p>{error}</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="report-panel-empty">
            <FontAwesomeIcon icon="fa-solid fa-clipboard" />
            <p>No reports found.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              group={group}
              onClick={handleRowClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ReportPanel;
