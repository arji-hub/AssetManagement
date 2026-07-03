import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReportCard from "../ui/card/ReportCard";
import { STATUS_GROUPS, COLUMNS } from "../../data/reports";
import "./ReportPanel.css";

function ReportPanel({
  group = "incident",
  statusFilter = "all",
  reports = [],
  loading = false,
  error = null,
}) {
  const navigate = useNavigate();

  const allowedStatuses = STATUS_GROUPS[group] || [];

  const filteredReports = reports.filter((r) => {
    if (!allowedStatuses.includes(r.status)) return false;
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
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
            <p>{error?.message || error}</p>
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
