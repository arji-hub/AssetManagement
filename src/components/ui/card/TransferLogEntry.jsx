import React from "react";
import { formatDate } from "../../../utils/date";
import "./TransferLogEntry.css";

function TransferLogEntry({ log }) {
  return (
    <div className="transfer-log-entry">
      <div className="transfer-log-dot" />
      <div className="transfer-log-content">
        <div className="transfer-log-top">
          <span className="transfer-log-action">{log.action}</span>
          <span className="transfer-log-date">{formatDate(log.date)}</span>
        </div>
        <span className="transfer-log-by">{log.by_name}</span>
        {log.note && (
          <p className="transfer-log-note">{log.note}</p>
        )}
      </div>
    </div>
  );
}

export default TransferLogEntry;