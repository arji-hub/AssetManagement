import React from "react";
import { Status } from "../ui/status/assetStatus";
import { formatDate } from "../../utils/date";
import "./AuditRoomHistory.css";

function AuditRoomHistory({ sessions = [], handleRowClick }) {
  return (
    <div className="audit-room-history">
      <div className="audit-room-history-header">
        <h4 className="audit-room-history-title">Recent Audit Sessions</h4>
      </div>

      <div className="audit-room-history-table-wrapper">
        <table className="audit-room-history-table">
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
                <td className="audit-room-history-empty" colSpan={6}>
                  No audit-room sessions yet.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr
                  key={session.id}
                  className="audit-room-history-row"
                  onClick={() => handleRowClick(session.room_id, session.id)}
                >
                  <td className="audit-room-history-audit-room-no">
                    {session.audit_no}
                  </td>
                  <td>{session.room_id}</td>
                  <td>{session.audited_by_name}</td>
                  <td className="audit-room-history-muted">
                    {formatDate(session.created_at)}
                  </td>
                  <td>
                    <Status status={session.status} />
                  </td>
                  <td
                    className={
                      session.discrepancy_count > 0
                        ? "audit-room-history-discrepancy"
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

export default AuditRoomHistory;
