import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Status } from "../ui/status/assetStatus";
import { formatDate } from "../../utils/date";
import useAuditRoomHistoryPagination from "../../hooks/audit/useAuditRoomHistory";
import "./AuditRoomHistory.css";

function AuditRoomHistory({ sessions = [], handleRowClick }) {
  const { items, totalCount, page, totalPages, goPrev, goNext } =
    useAuditRoomHistoryPagination({ sessions });

  return (
    <div className="audit-room-history">
      <div className="audit-room-history-header">
        <h4 className="audit-room-history-title">Recent Audit Sessions</h4>
      </div>

      {/* Desktop / tablet table */}
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
            {items.length === 0 ? (
              <tr>
                <td className="audit-room-history-empty" colSpan={6}>
                  No audit-room sessions yet.
                </td>
              </tr>
            ) : (
              items.map((session) => (
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

      {/* Mobile card list */}
      <div className="audit-room-history-card-list">
        {items.length === 0 ? (
          <p className="audit-room-history-empty">
            No audit-room sessions yet.
          </p>
        ) : (
          items.map((session) => (
            <div
              key={session.id}
              className="audit-room-history-card"
              onClick={() => handleRowClick(session.room_id, session.id)}
            >
              <div className="audit-room-history-card-header">
                <span className="audit-room-history-card-audit-no">
                  {session.audit_no}
                </span>
                <span className="audit-room-history-card-date">
                  {formatDate(session.created_at)}
                </span>
              </div>

              <p className="audit-room-history-card-room">{session.room_id}</p>

              <div className="audit-room-history-card-meta">
                <span className="audit-room-history-card-conducted-by">
                  {session.audited_by_name}
                </span>
                <div className="audit-room-history-card-status">
                  <Status status={session.status} />
                </div>
              </div>

              <div className="audit-room-history-card-discrepancies">
                <span className="audit-room-history-card-discrepancy-label">
                  Discrepancies:
                </span>
                <span
                  className={
                    session.discrepancy_count > 0
                      ? "audit-room-history-card-discrepancy-count"
                      : "audit-room-history-muted"
                  }
                >
                  {session.discrepancy_count ?? 0}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="audit-room-history-pagination">
          <span className="audit-room-history-pagination-info">
            Page {page} of {totalPages}
          </span>
          <div className="audit-room-history-pagination-controls">
            <button
              type="button"
              className="audit-room-history-pagination-btn"
              onClick={goPrev}
              disabled={page <= 1}
            >
              <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
              Prev
            </button>
            <button
              type="button"
              className="audit-room-history-pagination-btn"
              onClick={goNext}
              disabled={page >= totalPages}
            >
              Next
              <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditRoomHistory;
