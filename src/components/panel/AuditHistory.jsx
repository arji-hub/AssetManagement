import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../utils/date";
import useAuditHistory from "../../hooks/audit/useAuditHistory";
import "./AuditHistory.css";

function AuditHistory({
  reportLogs = [],
  auditLogs = [],
  onReportClick,
  onAuditClick,
}) {
  const {
    items,
    totalCount,
    page,
    totalPages,
    goPrev,
    goNext,
    handleItemClick,
    getItemSummary,
  } = useAuditHistory({ reportLogs, auditLogs, onReportClick, onAuditClick });

  return (
    <div className="audit-history">
      <div className="audit-history-header">
        <h4 className="audit-history-title">Audit History</h4>
      </div>

      {/* Desktop / tablet table */}
      <div className="audit-history-table-wrapper">
        <table className="audit-history-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Summary</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="audit-history-empty" colSpan={4}>
                  No audit history yet.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const {
                  isReport,
                  description,
                  primaryCount,
                  secondaryCount,
                  secondaryLabel,
                } = getItemSummary(item);

                return (
                  <tr
                    key={`${item.__type}-${item.id}`}
                    className="audit-history-row"
                    onClick={() => handleItemClick(item)}
                  >
                    <td>
                      <span
                        className={`audit-history-badge audit-history-badge--${
                          isReport ? "report" : "room"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={
                            isReport
                              ? "fa-solid fa-triangle-exclamation"
                              : "fa-solid fa-clipboard-check"
                          }
                        />
                        {isReport ? "Report" : "Audit"}
                      </span>
                    </td>
                    <td className="audit-history-audit-room-no">
                      {description}
                    </td>
                    <td>
                      <div className="audit-history-summary">
                        <span className="audit-history-muted">
                          {primaryCount} {isReport ? "reports" : "audited"}
                        </span>
                        <span
                          className={
                            secondaryCount > 0
                              ? "audit-history-discrepancy"
                              : "audit-history-muted"
                          }
                        >
                          {secondaryCount} {secondaryLabel}
                        </span>
                      </div>
                    </td>
                    <td className="audit-history-muted">
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="audit-history-card-list">
        {items.length === 0 ? (
          <p className="audit-history-empty">No audit history yet.</p>
        ) : (
          items.map((item) => {
            const {
              isReport,
              description,
              primaryCount,
              secondaryCount,
              secondaryLabel,
            } = getItemSummary(item);

            return (
              <div
                key={`${item.__type}-${item.id}`}
                className="audit-history-card"
                onClick={() => handleItemClick(item)}
              >
                <div className="audit-history-card-header">
                  <span
                    className={`audit-history-badge audit-history-badge--${
                      isReport ? "report" : "room"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={
                        isReport
                          ? "fa-solid fa-triangle-exclamation"
                          : "fa-solid fa-clipboard-check"
                      }
                    />
                    {isReport ? "Report" : "Audit"}
                  </span>
                  <span className="audit-history-card-date">
                    {formatDate(item.created_at)}
                  </span>
                </div>

                <p className="audit-history-card-title">{description}</p>

                <div className="audit-history-card-summary">
                  <span className="audit-history-muted">
                    {primaryCount} {isReport ? "reports" : "audited"}
                  </span>
                  <span
                    className={
                      secondaryCount > 0
                        ? "audit-history-discrepancy"
                        : "audit-history-muted"
                    }
                  >
                    {secondaryCount} {secondaryLabel}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="audit-history-pagination">
          <span className="audit-history-pagination-info">
            Page {page} of {totalPages}
          </span>
          <div className="audit-history-pagination-controls">
            <button
              type="button"
              className="audit-history-pagination-btn"
              onClick={goPrev}
              disabled={page <= 1}
            >
              <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
              Prev
            </button>
            <button
              type="button"
              className="audit-history-pagination-btn"
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

export default AuditHistory;
