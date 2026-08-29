import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import "./AuditRoomCard.css";

function AuditRoomCard({ room, columns, onClick }) {
  const navigate = useNavigate();
  const displayName = room.name || room.room_name || room.room?.name;

  let titleAssigned = false;
  const roledColumns = columns.map((col) => {
    if (col.card?.role) return { ...col, _cardRole: col.card.role };
    if (!titleAssigned && col.priority !== "low") {
      titleAssigned = true;
      return { ...col, _cardRole: "title" };
    }
    return { ...col, _cardRole: "meta" };
  });

  const titleCol = roledColumns.find((c) => c._cardRole === "title");
  const dateCol = roledColumns.find((c) => c._cardRole === "date");
  const assetsCol = roledColumns.find((c) => c._cardRole === "assets");
  const actionCol = roledColumns.find((c) => c._cardRole === "action");
  const metaCols = roledColumns.filter(
    (c) => c._cardRole === "meta" && c.card?.role !== "hidden",
  );

  const handleClick = () => {
    if (onClick) return onClick(room);
    navigate(`/audit/room/${room.room_id || room.id}`);
  };

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div className="room-audit-row" onClick={handleClick}>
        {roledColumns.map((col) => (
          <div
            key={col.key}
            className="room-audit-row-cell"
            data-priority={col.priority || "high"}
            onClick={
              col._cardRole === "action"
                ? (e) => e.stopPropagation()
                : undefined
            }
          >
            {col.render(room)}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div className="room-audit-card" onClick={handleClick}>
        <div className="room-audit-card-header">
          {titleCol && <h3 className="room-audit-name">{displayName}</h3>}
        </div>

        {(metaCols.length > 0 || dateCol) && (
          <div className="room-audit-card-meta">
            {metaCols.map((col) => (
              <span className="room-audit-card-custodian" key={col.key}>
                {col.card?.icon && <FontAwesomeIcon icon={col.card.icon} />}
                {room.roomCustodian || "—"}
              </span>
            ))}
            {dateCol && (
              <span className="room-audit-card-audit">
                <FontAwesomeIcon icon="fa-solid fa-clock-rotate-left" />
                {dateCol.render(room)}
              </span>
            )}
          </div>
        )}

        {assetsCol && (
          <div className="room-audit-assets">
            <span className="assets-icon-room-audit">
              <FontAwesomeIcon icon="fa-solid fa-box-archive" />
            </span>
            <span className="room-audit-assets-label">Total Assets</span>
            <span className="room-audit-assets-count">
              {room.assetCount ?? room.total_assets ?? 0}
            </span>
          </div>
        )}

        {actionCol && (
          <div
            className="room-audit-card-form"
            onClick={(e) => e.stopPropagation()}
          >
            {actionCol.render(room)}
          </div>
        )}
      </div>
    </>
  );
}

AuditRoomCard.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.string.isRequired,
    room_id: PropTypes.string,
    name: PropTypes.string,
    room_name: PropTypes.string,
    room: PropTypes.shape({ name: PropTypes.string }),
    roomCustodian: PropTypes.string,
    assetCount: PropTypes.number,
    total_assets: PropTypes.number,
    audited_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
    last_audited_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
  }).isRequired,
  columns: PropTypes.array.isRequired,
  onClick: PropTypes.func,
};

export default AuditRoomCard;
