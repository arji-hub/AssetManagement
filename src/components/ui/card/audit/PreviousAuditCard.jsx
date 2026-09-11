// PreviousAuditCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./PreviousAuditCard.css";

function resolveCardRoles(columns) {
  let titleAssigned = false;
  const roled = columns.map((col) => {
    if (col.card?.role) {
      if (col.card.role === "title") titleAssigned = true;
      return { ...col, _cardRole: col.card.role };
    }

    if (col.key === "date") return { ...col, _cardRole: "date" };
    if (!titleAssigned && col.priority !== "low") {
      titleAssigned = true;
      return { ...col, _cardRole: "title" };
    }
    return { ...col, _cardRole: "meta" };
  });

  return {
    titleCol: roled.find((c) => c._cardRole === "title"),
    dateCol: roled.find((c) => c._cardRole === "date"),
    headerLeftCol: roled.find((c) => c._cardRole === "headerLeft"),
    metaCols: roled.filter(
      (c) =>
        c._cardRole === "meta" &&
        c.card?.role !== "hidden" &&
        c.priority !== "low", // drop low-priority cols on mobile too
    ),
  };
}

function PreviousAuditCard({ audit, index, columns, roomID }) {
  const navigate = useNavigate();
  const { titleCol, dateCol, headerLeftCol, metaCols } =
    resolveCardRoles(columns);

  const handleClick = (item) => {
    const targetRoomID = item.room_id ?? roomID;
    navigate(`/audit/room/${targetRoomID}/${item.id}`);
  };

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div
        className="previous-audit-card-row"
        onClick={() => handleClick(audit)}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            className="previous-audit-card-row-cell"
            data-priority={col.priority || "high"}
          >
            {col.render(audit, index)}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div className="previous-audit-card" onClick={() => handleClick(audit)}>
        <div className="previous-audit-card-header">
          {headerLeftCol && (
            <span className="previous-audit-card-header-left">
              {headerLeftCol.card?.icon && (
                <FontAwesomeIcon icon={headerLeftCol.card.icon} />
              )}
              {headerLeftCol.render(audit, index)}
            </span>
          )}
          {dateCol && (
            <span className="previous-audit-card-date">
              {dateCol.render(audit, index)}
            </span>
          )}
        </div>

        {titleCol && (
          <p className="previous-audit-card-title">
            {titleCol.render(audit, index)}
          </p>
        )}

        {metaCols.length > 0 && (
          <div className="previous-audit-card-meta">
            {metaCols.map((col) => (
              <span className="previous-audit-card-stat" key={col.key}>
                {col.card?.icon && (
                  <span className="previous-audit-card-meta-icon">
                    <FontAwesomeIcon icon={col.card.icon} />
                  </span>
                )}
                {col.label && (
                  <span className="previous-audit-card-meta-label">
                    {col.label}:
                  </span>
                )}
                <span className="previous-audit-card-meta-value">
                  {col.render(audit, index)}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default PreviousAuditCard;
