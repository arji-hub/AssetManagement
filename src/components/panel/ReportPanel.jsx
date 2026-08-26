import React from "react";
import { useNavigate } from "react-router-dom";
import ReportCard from "../ui/card/report/ReportCard";
import Table from "../panel/Table";
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

  const { items } = useReportPanel({ group, statusFilter, reports });

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

      <Table
        items={items}
        loading={loading}
        error={error}
        itemLabel="incidents"
        emptyMessage="No incidents found."
        emptyIcon="fa-solid fa-clipboard"
        renderItem={(report) => (
          <ReportCard
            key={report.id}
            report={report}
            group={group}
            onClick={handleRowClick}
          />
        )}
      />
    </div>
  );
}

export default ReportPanel;
