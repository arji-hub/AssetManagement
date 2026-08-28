import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./AssetCard.css";

function resolveCardRoles(columns) {
  let titleAssigned = false;
  const roled = columns.map((col) => {
    if (col.card?.role) return { ...col, _cardRole: col.card.role };

    if (col.key === "status") return { ...col, _cardRole: "badge" };
    if (/date/i.test(col.key)) return { ...col, _cardRole: "date" };
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

function AssetCard({ asset, index, columns, onClick }) {
  const { titleCol, badgeCol, dateCol, metaCols } = resolveCardRoles(columns);

  const handleClick = () => onClick?.(asset);

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div className="asset-card-row" onClick={handleClick}>
        {columns.map((col) => (
          <div
            key={col.key}
            className="asset-card-row-cell"
            data-priority={col.priority || "high"}
          >
            {col.key === "desc" ? (
              <span className="asset-desc-cell">
                {col.render(asset, index)}
              </span>
            ) : (
              col.render(asset, index)
            )}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div className="asset-card" onClick={handleClick}>
        <div className="asset-card-header">
          {dateCol && (
            <span className="asset-card-date">
              {dateCol.render(asset, index)}
            </span>
          )}
          {badgeCol && (
            <div className="asset-card-badge-slot">
              {badgeCol.render(asset, index)}
            </div>
          )}
        </div>

        {titleCol && (
          <p className="asset-card-title">{titleCol.render(asset, index)}</p>
        )}

        {metaCols.length > 0 && (
          <div className="asset-card-meta">
            {metaCols.map((col) => (
              <span className="asset-card-stat" key={col.key}>
                {col.card?.icon && (
                  <span className="asset-card-meta-icon">
                    <FontAwesomeIcon icon={col.card.icon} />
                  </span>
                )}
                {col.render(asset, index)}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default AssetCard;
