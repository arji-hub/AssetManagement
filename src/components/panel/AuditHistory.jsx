import React from "react";
import "./AuditHistory.css";

function statusBadgeClass(status) {
  if (status === "completed") return "audit-history-badge--completed";
  if (status === "in_progress") return "audit-history-badge--progress";
  return "audit-history-badge--neutral";
}

function statusLabel(status) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return status ?? "N/A";
}

function AuditHistory({ sessions = [], onViewAll, onRowClick }) {
  return (
    <div className="audit-history">
      <div className="audit-history-header">
        <h4 className="audit-history-title">Recent Audit Sessions</h4>
        <button className="audit-history-view-all" onClick={onViewAll} type="button">
          View all sessions
        </button>
      </div>

      <div className="audit-history-table-wrapper">
        <table className="audit-history-table">
          <thead>
            <tr>
              <th>Audit No.</th>
              <th>Room</th>
              <th>Conducted by</th>
              <th>Date</th>
              <th>Status</th>
              <th>Discrepancies</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td className="audit-history-empty" colSpan={6}>
                  No audit sessions yet.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr
                  key={session.audit_no}
                  className="audit-history-row"
                  onClick={() => onRowClick?.(session)}
                >
                  <td className="audit-history-audit-no">{session.audit_no}</td>
                  <td>{session.room_name}</td>
                  <td>{session.conducted_by_name}</td>
                  <td className="audit-history-muted">{session.date}</td>
                  <td>
                    <span
                      className={`audit-history-badge ${statusBadgeClass(
                        session.status
                      )}`}
                    >
                      {statusLabel(session.status)}
                    </span>
                  </td>
                  <td
                    className={
                      session.discrepancy_count > 0
                        ? "audit-history-discrepancy"
                        : ""
                    }
                  >
                    {session.discrepancy_count ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditHistory;