import React from "react";
import { Status } from "../ui/status/assetStatus";
import { formatDate } from "../../utils/date";
import "./AuditHistory.css";

function AuditHistory({ sessions = [], onViewAll, handleRowClick }) {
  return (
    <div className="audit-history">
      <div className="audit-history-header">
        <h4 className="audit-history-title">Recent Audit Sessions</h4>
        <button
          className="audit-history-view-all"
          onClick={onViewAll}
          type="button"
        >
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
                  key={session.id}
                  className="audit-history-row"
                  onClick={() => handleRowClick(session.room_id, session.id)}
                >
                  <td className="audit-history-audit-no">{session.audit_no}</td>
                  <td>{session.room_id}</td>
                  <td>{session.audited_by_name}</td>
                  <td className="audit-history-muted">
                    {formatDate(session.created_at)}
                  </td>
                  <td>
                    <Status status={session.status} />
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
