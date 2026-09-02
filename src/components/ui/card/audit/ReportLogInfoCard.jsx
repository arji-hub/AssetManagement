import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../../../utils/date";
import "./ReportLogInfoCard.css";

function ReportLogInfoCard({ report, columns, onClick }) {
  const roledColumns = columns.map((col) => ({
    ...col,
    _cardRole: col.card?.role || "meta",
  }));

  const titleCol = roledColumns.find((c) => c._cardRole === "title");
  const badgeCol = roledColumns.find((c) => c._cardRole === "badge");
  const metaCols = roledColumns.filter((c) => c._cardRole === "meta");
  const dateCol = roledColumns.find((c) => c._cardRole === "date");

  const handleClick = () => onClick?.(report);

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div className="report-log-info-row" onClick={handleClick}>
        {roledColumns.map((col) => (
          <div
            key={col.key}
            className="report-log-info-row-cell"
            data-priority={col.priority || "high"}
          >
            {col.render(report)}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div className="report-log-info-card" onClick={handleClick}>
        <div className="report-log-info-card-header">
          {titleCol && (
            <p className="report-log-info-card-title">
              {titleCol.render(report)}
            </p>
          )}
          {badgeCol && badgeCol.render(report)}
        </div>

        <div className="report-log-info-card-meta">
          {metaCols.map(
            (col) =>
              col.render(report) && (
                <div className="report-log-info-card-meta-row" key={col.key}>
                  <div className="report-log-info-card-meta-item">
                    {col.card?.icon && (
                      <div
                        className="report-log-info-card-meta-icon"
                        title={col.label}
                      >
                        <FontAwesomeIcon icon={col.card.icon} />
                      </div>
                    )}
                    <span className="report-log-info-card-meta-value">
                      {col.render(report)}
                    </span>
                  </div>
                  {col.key === "reported_by" && dateCol && (
                    <div className="report-log-info-card-date">
                      {formatDate(report.created_at)}
                    </div>
                  )}
                </div>
              ),
          )}
        </div>
      </div>
    </>
  );
}

ReportLogInfoCard.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.string.isRequired,
    report_no: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    reported_by: PropTypes.string,
    reported_by_name: PropTypes.string,
    location: PropTypes.string,
    created_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
  }).isRequired,
  columns: PropTypes.array.isRequired,
  onClick: PropTypes.func,
};

export default ReportLogInfoCard;
