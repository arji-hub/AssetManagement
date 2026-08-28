import React from "react";
import "./TransferRoomCard.css";

function TransferRoomCard({ request, columns }) {
  const titleCol = columns.find((c) => c.card?.role === "title");
  const descCol = columns.find((c) => c.card?.role === "desc");
  const fromCol = columns.find((c) => c.card?.role === "from");
  const toCol = columns.find((c) => c.card?.role === "to");
  const dateCol = columns.find((c) => c.card?.role === "date");

  return (
    <>
      {/* Desktop / tablet grid row */}
      <div className="transfer-card-row-room">
        {columns.map((col) => (
          <div
            key={col.key}
            className={`transfer-card-cell${
              col.card?.role === "title" ? " transfer-card-id" : ""
            }${col.card?.role === "desc" ? " transfer-card-desc" : ""}`}
            data-priority={col.priority || "high"}
          >
            {col.render(request)}
          </div>
        ))}
      </div>

      {/* Mobile card */}
      <div className="transfer-card-room-mobile">
        <div className="transfer-card-room-mobile-header">
          {titleCol && (
            <span className="transfer-card-room-mobile-id">
              {titleCol.render(request)}
            </span>
          )}
          {dateCol && (
            <span className="transfer-card-room-mobile-date">
              {dateCol.render(request)}
            </span>
          )}
        </div>

        {descCol && (
          <p className="transfer-card-room-mobile-desc">
            {descCol.render(request)}
          </p>
        )}

        <div className="transfer-card-room-mobile-route">
          {fromCol && (
            <span className="transfer-card-room-mobile-room">
              {fromCol.render(request)}
            </span>
          )}
          <span className="transfer-card-room-mobile-arrow">→</span>
          {toCol && (
            <span className="transfer-card-room-mobile-room transfer-card-room-mobile-room--to">
              {toCol.render(request)}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default TransferRoomCard;
