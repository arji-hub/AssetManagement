import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReportCard from "../ui/card/ReportCard";
import { COLUMNS } from "../../data/reports";
import useReportPanel from "../../hooks/report/useReportPanel";
import "./ReportPanel.css";

function ReportPanel({
  group = "incident",
  statusFilter = "all",
  reports = [],
  loading = false,
  error = null,
}) {
  const navigate = useNavigate();

  const { items, totalCount, page, totalPages, goPrev, goNext } =
    useReportPanel({ group, statusFilter, reports });

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
        ) : items.length === 0 ? (
          <div className="report-panel-empty">
            <FontAwesomeIcon icon="fa-solid fa-clipboard" />
            <p>No reports found.</p>
          </div>
        ) : (
          items.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              group={group}
              onClick={handleRowClick}
            />
          ))
        )}
      </div>

      {!loading && !error && totalCount > 0 && (
        <div className="report-panel-pagination">
          <span className="report-panel-pagination-info">
            Page {page} of {totalPages}
          </span>
          <div className="report-panel-pagination-controls">
            <button
              type="button"
              className="report-panel-pagination-btn"
              onClick={goPrev}
              disabled={page <= 1}
            >
              <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
              Prev
            </button>
            <button
              type="button"
              className="report-panel-pagination-btn"
              onClick={goNext}
              disabled={page >= totalPages}
            >
              Next
              <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportPanel;
