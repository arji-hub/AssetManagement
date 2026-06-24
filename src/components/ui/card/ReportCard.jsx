import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Status } from "../status/assetStatus";
import { getReportType } from "../../../utils/report";
import { formatDate } from "../../../utils/date";
import { toTitleCase } from "../../../utils/TextCasing";
import "./ReportCard.css";

function ReportCard({ report, group = "incident", onClick }) {
  const reportType = getReportType(report);

  return (
    <div className="report-card-row" onClick={() => onClick(report)}>
      {/* shared columns — all groups */}
      <div className="report-card-cell report-card-id">{report.asset_id}</div>
      <div className="report-card-cell report-card-desc">
        {group === "incident" ? report.narrative : report.description}
      </div>
      <div className="report-card-cell">{report.location}</div>
      <div className="report-card-cell">{report.reported_by_name}</div>
      <div className="report-card-cell">{formatDate(report.date_reported)}</div>

      {/* incident — current status badge */}
      {group === "incident" && (
        <div className="report-card-cell report-card-status">
          <Status status={report.status} />
        </div>
      )}

      {/* repair — no extra column */}

      {/* resolved + archive — incident type badge + date resolved */}
      {(group === "resolved" || group === "archive") && (
        <>
          <div className="report-card-cell">
            <span className={`report-card-incident-type ${reportType}`}>
              {toTitleCase(reportType)}
            </span>
          </div>
          <div className="report-card-cell">
            {report.date_resolved ? formatDate(report.date_resolved) : "—"}
          </div>
        </>
      )}
    </div>
  );
}

export default ReportCard;
