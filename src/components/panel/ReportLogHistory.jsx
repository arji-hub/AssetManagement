import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../utils/date";
import "./ReportLogHistory.css";

function ReportLogHistory({ logs = [], onViewAll, handleRowClick }) {
  return (
    <div className="report-log-history">
      <div className="report-log-history-header">
        <h4 className="report-log-history-title">Recent Report Logs</h4>
        <button
          className="report-log-history-view-all"
          onClick={onViewAll}
          type="button"
        >
          View all logs
        </button>
      </div>

      {/* Desktop / tablet table */}
      <div className="report-log-history-table-wrapper">
        <table className="report-log-history-table">
          <thead>
            <tr>
              <th>Log Name</th>
              <th>Total Reports</th>
              <th>Damaged</th>
              <th>Missing</th>
              <th>Date Generated</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td className="report-log-history-empty" colSpan={5}>
                  No report logs yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="report-log-history-row"
                  onClick={() => handleRowClick(log.id)}
                >
                  <td className="report-log-history-log-name">
                    {log.log_name}
                  </td>
                  <td>
                    <span className="report-log-history-badge">
                      {log.report_count ?? 0}
                    </span>
                  </td>
                  <td
                    className={
                      log.damaged_count > 0
                        ? "report-log-history-damaged"
                        : "report-log-history-muted"
                    }
                  >
                    {log.damaged_count ?? 0}
                  </td>
                  <td
                    className={
                      log.missing_count > 0
                        ? "report-log-history-missing"
                        : "report-log-history-muted"
                    }
                  >
                    {log.missing_count ?? 0}
                  </td>
                  <td className="report-log-history-muted">
                    {formatDate(log.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="report-log-history-card-list">
        {logs.length === 0 ? (
          <p className="report-log-history-empty">No report logs yet.</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="report-log-history-card"
              onClick={() => handleRowClick(log.id)}
            >
              <div className="report-log-history-card-header">
                <p className="report-log-history-card-title">
                  {log.log_name}
                </p>
                <span className="report-log-history-badge">
                  {log.report_count ?? 0} total
                </span>
              </div>

              <div className="report-log-history-card-meta">
                <div className="report-log-history-card-meta-row">
                  <div className="report-log-history-card-stat">
                    <div
                      className="report-log-history-card-meta-icon"
                      title="Damaged"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
                    </div>
                    <span
                      className={
                        log.damaged_count > 0
                          ? "report-log-history-damaged"
                          : "report-log-history-muted"
                      }
                    >
                      {log.damaged_count ?? 0} damaged
                    </span>
                  </div>

                  <div className="report-log-history-card-stat">
                    <div
                      className="report-log-history-card-meta-icon"
                      title="Missing"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-circle-question" />
                    </div>
                    <span
                      className={
                        log.missing_count > 0
                          ? "report-log-history-missing"
                          : "report-log-history-muted"
                      }
                    >
                      {log.missing_count ?? 0} missing
                    </span>
                  </div>
                </div>

                <div className="report-log-history-card-date">
                  {formatDate(log.created_at)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReportLogHistory;