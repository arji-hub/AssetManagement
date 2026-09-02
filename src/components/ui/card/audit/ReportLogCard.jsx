import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./ReportLogCard.css";

function ReportLogCard({ log, columns, onClick }) {
  const roledColumns = columns.map((col) => ({
    ...col,
    _cardRole: col.card?.role || "meta",
  }));

  const titleCol = roledColumns.find((c) => c._cardRole === "title");
  const badgeCol = roledColumns.find((c) => c._cardRole === "badge");
  const statCols = roledColumns.filter((c) => c._cardRole === "stat");
  const dateCol = roledColumns.find((c) => c._cardRole === "date");

  const handleClick = () => onClick?.(log);

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div className="report-log-row" onClick={handleClick}>
        {roledColumns.map((col) => (
          <div
            key={col.key}
            className="report-log-row-cell"
            data-priority={col.priority || "high"}
          >
            {col.render(log)}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div className="report-log-card" onClick={handleClick}>
        <div className="report-log-card-header">
          {titleCol && (
            <p className="report-log-card-title">{titleCol.render(log)}</p>
          )}
          {badgeCol && (
            <span className="report-log-card-badge-wrap">
              {badgeCol.render(log)} total
            </span>
          )}
        </div>

        {statCols.length > 0 && (
          <div className="report-log-card-meta">
            <div className="report-log-card-meta-row">
              {statCols.map((col) => (
                <div className="report-log-card-stat" key={col.key}>
                  {col.card?.icon && (
                    <div
                      className="report-log-card-meta-icon"
                      title={col.label}
                    >
                      <FontAwesomeIcon icon={col.card.icon} />
                    </div>
                  )}
                  {col.render(log)}
                  <span className="report-log-card-stat-label">
                    {col.label.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>

            {dateCol && (
              <div className="report-log-card-date">{dateCol.render(log)}</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

ReportLogCard.propTypes = {
  log: PropTypes.shape({
    id: PropTypes.string.isRequired,
    log_name: PropTypes.string,
    report_count: PropTypes.number,
    damaged_count: PropTypes.number,
    missing_count: PropTypes.number,
    created_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
  }).isRequired,
  columns: PropTypes.array.isRequired,
  onClick: PropTypes.func,
};

export default ReportLogCard;
