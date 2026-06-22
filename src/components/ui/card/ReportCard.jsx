import React from "react";
import { formatDate } from "../../../utils/date";
import "./ReportCard.css";
import { Status } from "../status/assetStatus";

function ReportCard({ report, onClick }) {
  return (
    <div className="report-card-row" onClick={() => onClick?.(report)}>
      <div className="report-card-cell report-card-id">
        {report.asset_id || "—"}
      </div>
      <div className="report-card-cell report-card-desc">
        {report.narrative || "—"}
      </div>
      <div className="report-card-cell">
        {report.room_id || report.location || "—"}
      </div>
      <div className="report-card-cell">{report.reported_by_name || "—"}</div>
      <div className="report-card-cell">
        {formatDate(report.date_reported || report.created_at)}
      </div>
      <div className="report-card-cell report-card-status">
        <Status status={report.status} />
      </div>
    </div>
  );
}

export default ReportCard;
