import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./ReportCard.css";

function resolveReportCardRoles(columns) {
  const roled = columns.map((col) => ({
    ...col,
    _role: col.card?.role || "meta",
  }));

  return {
    titleCol: roled.find((c) => c._role === "title"),
    badgeCol: roled.find((c) => c._role === "badge"),
    dateCol: roled.find((c) => c._role === "date"),
    descCol: roled.find((c) => c._role === "desc"),
    footerCol: roled.find((c) => c._role === "footer"),
    metaCols: roled.filter((c) => c._role === "meta"),
  };
}

function ReportCard({ report, columns, onClick }) {
  const { titleCol, badgeCol, dateCol, descCol, footerCol, metaCols } =
    resolveReportCardRoles(columns);

  const handleClick = () => onClick?.(report);

  return (
    <>
      {/* Desktop / tablet grid row */}
      <div className="report-card-row" onClick={handleClick}>
        {columns.map((col) => (
          <div
            key={col.key}
            className={`report-card-cell${
              col._cardRole === "title" ? " report-card-id" : ""
            }${
              col.card?.role === "desc" || col.card?.role === "meta"
                ? " report-card-desc"
                : ""
            }`}
            data-priority={col.priority || "high"}
          >
            {col.render(report)}
          </div>
        ))}
      </div>

      {/* Mobile card */}
      <div className="report-card-mobile" onClick={handleClick}>
        <div className="report-card-mobile-header">
          {badgeCol && badgeCol.render(report)}
          {dateCol && (
            <span className="report-card-mobile-date">
              {dateCol.render(report)}
            </span>
          )}
        </div>

        {titleCol && (
          <p className="report-card-mobile-title">{titleCol.render(report)}</p>
        )}

        {descCol && (
          <p className="report-card-mobile-desc">{descCol.render(report)}</p>
        )}

        {metaCols.length > 0 && (
          <div className="report-card-mobile-meta">
            {metaCols.map((col) => (
              <span className="report-card-mobile-meta-item" key={col.key}>
                {col.card?.icon && <FontAwesomeIcon icon={col.card.icon} />}
                {col.render(report)}
              </span>
            ))}
          </div>
        )}

        {footerCol && (
          <div className="report-card-mobile-footer">
            Resolved: {footerCol.render(report)}
          </div>
        )}
      </div>
    </>
  );
}

export default ReportCard;
