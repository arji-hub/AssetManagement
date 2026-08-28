import React from "react";
import "./TransferCard.css";

function resolveTransferCardRoles(columns) {
  const roled = columns.map((col) => ({
    ...col,
    _role: col.card?.role || "meta",
  }));

  return {
    titleCol: roled.find((c) => c._role === "title"),
    badgeCol: roled.find((c) => c._role === "badge"),
    dateCol: roled.find((c) => c._role === "date"),
    descCol: roled.find((c) => c._role === "desc"),
    metaCols: roled.filter((c) => c._role === "meta"),
  };
}

function TransferCard({ request, columns, onClick }) {
  const { titleCol, badgeCol, dateCol, descCol, metaCols } =
    resolveTransferCardRoles(columns);

  const handleClick = () => onClick?.(request);

  return (
    <>
      {/* Desktop / tablet grid row */}
      <div className="transfer-card-row" onClick={handleClick}>
        {columns.map((col) => (
          <div
            key={col.key}
            className={`transfer-card-cell${
              col.card?.role === "title" ? " transfer-card-id" : ""
            }${col.card?.role === "desc" ? " transfer-card-desc" : ""}${
              col.card?.role === "badge" ? " transfer-card-status" : ""
            }`}
            data-priority={col.priority || "high"}
          >
            {col.render(request)}
          </div>
        ))}
      </div>

      {/* Mobile card */}
      <div className="transfer-card-mobile" onClick={handleClick}>
        <div className="transfer-card-mobile-header">
          {badgeCol && badgeCol.render(request)}
          {dateCol && (
            <span className="transfer-card-mobile-date">
              {dateCol.render(request)}
            </span>
          )}
        </div>

        {titleCol && (
          <p className="transfer-card-mobile-title">
            {titleCol.render(request)}
          </p>
        )}

        {descCol && (
          <p className="transfer-card-mobile-desc">{descCol.render(request)}</p>
        )}

        {metaCols.length > 0 && (
          <div className="transfer-card-mobile-meta">
            {metaCols.map((col) => (
              <span className="transfer-card-mobile-meta-item" key={col.key}>
                {col.render(request)}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default TransferCard;
