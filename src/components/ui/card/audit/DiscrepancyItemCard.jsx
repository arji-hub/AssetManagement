import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./DiscrepancyItemCard.css";

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
    metaCols: roled.filter(
      (c) => c._cardRole === "meta" && c.card?.role !== "hidden",
    ),
  };
}

function DiscrepancyItemCard({ item, index, columns }) {
  const { titleCol, badgeCol, dateCol, metaCols } = resolveCardRoles(columns);

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div className="discrepancy-item-card-row">
        {columns.map((col) => (
          <div
            key={col.key}
            className="discrepancy-item-card-row-cell"
            data-priority={col.priority || "high"}
          >
            {col.render(item, index)}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div className="discrepancy-item-card">
        <div className="discrepancy-item-card-header">
          {titleCol && (
            <p className="discrepancy-item-card-title">
              {titleCol.render(item, index)}
            </p>
          )}
          {badgeCol && (
            <div className="discrepancy-item-card-badge-slot">
              {badgeCol.render(item, index)}
            </div>
          )}
        </div>

        {(metaCols.length > 0 || dateCol) && (
          <div className="discrepancy-item-card-meta">
            {metaCols.map((col) => (
              <span className="discrepancy-item-card-stat" key={col.key}>
                {col.card?.icon && (
                  <span className="discrepancy-item-card-meta-icon">
                    <FontAwesomeIcon icon={col.card.icon} />
                  </span>
                )}
                {col.render(item, index)}
              </span>
            ))}
            {dateCol && (
              <span className="discrepancy-item-card-stat">
                <span className="discrepancy-item-card-meta-icon">
                  <FontAwesomeIcon icon="fa-solid fa-calendar-check" />
                </span>
                {dateCol.render(item, index)}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default DiscrepancyItemCard;
