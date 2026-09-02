import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../../../utils/date";
import "./ReportLogCreateCard.css";

function ReportLogCreateCard({
  report,
  columns,
  selected,
  onToggleSelect,
  onClick,
}) {
  const roledColumns = columns.map((col) => ({
    ...col,
    _cardRole: col.card?.role || "meta",
  }));

  const titleCol = roledColumns.find((c) => c._cardRole === "title");
  const badgeCol = roledColumns.find((c) => c._cardRole === "badge");
  const metaCols = roledColumns.filter((c) => c._cardRole === "meta");
  const dateCol = roledColumns.find((c) => c._cardRole === "date");

  const handleRowClick = () => onClick?.(report);
  const handleCheckboxClick = (e) => e.stopPropagation();

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div
        className={`report-log-create-row${selected ? " report-log-create-row-selected" : ""}`}
        onClick={handleRowClick}
      >
        <div
          className="report-log-create-row-checkbox"
          onClick={handleCheckboxClick}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(report.id)}
          />
        </div>
        {roledColumns.map((col) => (
          <div
            key={col.key}
            className="report-log-create-row-cell"
            data-priority={col.priority || "high"}
          >
            {col.render(report)}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div
        className={`report-log-create-card${selected ? " report-log-create-card-selected" : ""}`}
        onClick={handleRowClick}
      >
        <div className="report-log-create-card-header">
          <div onClick={handleCheckboxClick}>
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(report.id)}
            />
          </div>
          {titleCol && (
            <p className="report-log-create-card-title">
              {titleCol.render(report)}
            </p>
          )}
          {badgeCol && badgeCol.render(report)}
        </div>

        <div className="report-log-create-card-meta">
          {metaCols.map(
            (col) =>
              col.render(report) && (
                <div className="report-log-create-card-meta-row" key={col.key}>
                  <div className="report-log-create-card-meta-item">
                    {col.card?.icon && (
                      <div
                        className="report-log-create-card-meta-icon"
                        title={col.label}
                      >
                        <FontAwesomeIcon icon={col.card.icon} />
                      </div>
                    )}
                    <span className="report-log-create-card-meta-value">
                      {col.render(report)}
                    </span>
                  </div>
                  {dateCol && (
                    <div className="report-log-create-card-date">
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

ReportLogCreateCard.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.string.isRequired,
    report_no: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    reported_by_name: PropTypes.string,
    created_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
  }).isRequired,
  columns: PropTypes.array.isRequired,
  selected: PropTypes.bool,
  onToggleSelect: PropTypes.func.isRequired,
  onClick: PropTypes.func,
};

export default ReportLogCreateCard;
