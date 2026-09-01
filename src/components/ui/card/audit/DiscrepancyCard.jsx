import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./DiscrepancyCard.css";

function resolveCardRoles(columns) {
  let titleAssigned = false;
  const roled = columns.map((col) => {
    if (col.card?.role) return { ...col, _cardRole: col.card.role };

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
    metaCols: roled.filter(
      (c) => c._cardRole === "meta" && c.card?.role !== "hidden",
    ),
  };
}

function DiscrepancyCard({ audit, index, columns, roomID }) {
  const navigate = useNavigate();
  const { titleCol, dateCol, metaCols } = resolveCardRoles(columns);

  const handleClick = (id) => {
    navigate(`/audit/room/${roomID}/${id}`);
  };

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div
        className="discrepancy-card-row"
        onClick={() => handleClick(audit.id)}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            className="discrepancy-card-row-cell"
            data-priority={col.priority || "high"}
          >
            {col.render(audit, index)}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div className="discrepancy-card" onClick={() => handleClick(audit.id)}>
        <div className="discrepancy-card-header">
          {dateCol && (
            <span className="discrepancy-card-date">
              {dateCol.render(audit, index)}
            </span>
          )}
        </div>

        {titleCol && (
          <p className="discrepancy-card-title">
            {titleCol.render(audit, index)}
          </p>
        )}

        {metaCols.length > 0 && (
          <div className="discrepancy-card-meta">
            {metaCols.map((col) => (
              <span className="discrepancy-card-stat" key={col.key}>
                {col.card?.icon && (
                  <span className="discrepancy-card-meta-icon">
                    <FontAwesomeIcon icon={col.card.icon} />
                  </span>
                )}
                {col.render(audit, index)}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default DiscrepancyCard;
