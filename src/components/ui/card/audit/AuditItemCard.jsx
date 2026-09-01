import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./AuditItemCard.css";

function resolveCardRoles(columns) {
  let titleAssigned = false;
  const roled = columns.map((col) => {
    if (col.card?.role) return { ...col, _cardRole: col.card.role };
    if (!titleAssigned && col.priority !== "low") {
      titleAssigned = true;
      return { ...col, _cardRole: "title" };
    }
    return { ...col, _cardRole: "meta" };
  });

  return {
    titleCol: roled.find((c) => c._cardRole === "title"),
    badgeCol: roled.find((c) => c._cardRole === "badge"),
    dateCol: roled.find((c) => c._cardRole === "date"),
    actionCol: roled.find((c) => c._cardRole === "action"),
    metaCols: roled.filter(
      (c) => c._cardRole === "meta" && c.card?.role !== "hidden",
    ),
  };
}

function AuditItemCard({ item, index, columns, onRowClick }) {
  const { titleCol, badgeCol, dateCol, actionCol, metaCols } =
    resolveCardRoles(columns);

  const handleClick = () => onRowClick?.(item.id);

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div className="audit-item-card-row" onClick={handleClick}>
        {columns.map((col) => (
          <div
            key={col.key}
            className="audit-item-card-row-cell"
            data-priority={col.priority || "high"}
          >
            {col.render(item, index)}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div className="audit-item-card" onClick={handleClick}>
        <div className="audit-item-card-header">
          {titleCol && (
            <p className="audit-item-card-title">
              {titleCol.render(item, index)}
            </p>
          )}
          {badgeCol && (
            <div className="audit-item-card-badge-slot">
              {badgeCol.render(item, index)}
            </div>
          )}
        </div>

        {(metaCols.length > 0 || dateCol) && (
          <div className="audit-item-card-meta">
            {metaCols.map((col) => (
              <span className="audit-item-card-stat" key={col.key}>
                {col.card?.icon && (
                  <span className="audit-item-card-meta-icon">
                    <FontAwesomeIcon icon={col.card.icon} />
                  </span>
                )}
                {col.render(item, index)}
              </span>
            ))}
            {dateCol && (
              <span className="audit-item-card-stat">
                <span className="audit-item-card-meta-icon">
                  <FontAwesomeIcon icon="fa-solid fa-calendar-check" />
                </span>
                {dateCol.render(item, index)}
              </span>
            )}
          </div>
        )}

        {actionCol && (
          <div className="audit-item-card-action">
            {actionCol.render(item, index)}
          </div>
        )}
      </div>
    </>
  );
}

export default AuditItemCard;
