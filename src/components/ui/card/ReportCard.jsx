import React from "react";
import { STATUS_COLORS } from "../../../data/assets";
import { formatDate } from "../../../utils/date";
import "./ReportCard.css";

function ReportStatusBadge({ status }) {
  if (!status) return null;
  const style = STATUS_COLORS[status] || {
    bg: "rgba(136,136,136,0.7)",
    color: "#1f1f1f",
  };
  return (
    <span
      className="report-card-status-badge"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}

function ReportCard({ report, onClick }) {
  return (
    <div className="report-card-row" onClick={() => onClick?.(report)}>
      <div className="report-card-cell report-card-id">
        {report.asset_id || "—"}
      </div>
      <div className="report-card-cell report-card-desc">
        {report.description || "—"}
      </div>
      <div className="report-card-cell">
        {report.room_id || report.location || "—"}
      </div>
      <div className="report-card-cell">
        {report.reported_by_name || "—"}
      </div>
      <div className="report-card-cell">
        {formatDate(report.date_reported || report.created_at)}
      </div>
      <div className="report-card-cell report-card-status">
        <ReportStatusBadge status={report.status} />
      </div>
    </div>
  );
}

export default ReportCard;