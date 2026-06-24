import React from "react";
import { Status } from "../status/assetStatus";
import { formatDate } from "../../../utils/date";
import "./ReportLog.css";

function ReportLog({ log }) {
  return (
    <div className="report-info-log-item">
      <div className="report-info-log-dot" />
      <div className="report-info-log-content">
        <div className="report-info-log-top">
          <Status status={log.status} />
          <span className="report-info-log-date">
            {formatDate(log.date)}
          </span>
        </div>
        {log.note && <p className="report-info-log-note">{log.note}</p>}
        {log.img && (
          <img
            src={log.img}
            alt={`Evidence for ${log.status}`}
            className="report-info-log-img"
          />
        )}
      </div>
    </div>
  );
}

export default ReportLog;