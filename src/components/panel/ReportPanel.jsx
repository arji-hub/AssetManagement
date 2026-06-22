// components/panel/ReportPanel.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReportCard from "../ui/card/ReportCard";
import { MOCK_REPORTS, STATUS_GROUPS, COLUMNS } from "../../data/reports";
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

  const filteredReports = (reports || []).filter(
    (r) => allowedStatuses.includes(r.status) && statusFilter.includes(r.type),
  );

  const handleRowClick = (report) => {
    navigate(`/report/${report.id}`);
  };

  return (
    <div className="report-panel">
      <div className="report-panel-header">
        {COLUMNS.map((col) => (
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
              onClick={handleRowClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ReportPanel;
