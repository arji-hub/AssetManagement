import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import "./RoomCard.css";

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
    dateCol: roled.find((c) => c._cardRole === "date"),
    assetsCol: roled.find((c) => c._cardRole === "assets"),
    metaCols: roled.filter(
      (c) => c._cardRole === "meta" && c.card?.role !== "hidden",
    ),
  };
}

function RoomCard({ room, columns, onClick }) {
  const navigate = useNavigate();
  const { id } = room;
  const { titleCol, dateCol, assetsCol, metaCols } = resolveCardRoles(columns);

  const handleClick = () => {
    if (onClick) return onClick(room);
    navigate(`/room/${id}`);
  };

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div className="room-row" onClick={handleClick}>
        {columns.map((col) => (
          <div
            key={col.key}
            className="room-row-cell"
            data-priority={col.priority || "high"}
          >
            {col.render(room)}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div className="room-card" onClick={handleClick}>
        <div className="room-card-header">
          {titleCol && <h3 className="room-name">{room.name}</h3>}
        </div>

        {(metaCols.length > 0 || dateCol) && (
          <div className="room-card-meta">
            {metaCols.map((col) => (
              <span className="room-card-custodian" key={col.key}>
                {col.card?.icon && <FontAwesomeIcon icon={col.card.icon} />}
                {room.roomCustodian || "—"}
              </span>
            ))}
            {dateCol && (
              <span className="room-card-audit">
                <FontAwesomeIcon icon="fa-solid fa-clock-rotate-left" />
                {dateCol.render(room)}
              </span>
            )}
          </div>
        )}

        {assetsCol && (
          <div className="room-assets">
            <span className="assets-icon-room">
              <FontAwesomeIcon icon="fa-solid fa-box-archive" />
            </span>
            <span className="room-assets-label">Total Assets</span>
            <span className="room-assets-count">{room.assetCount ?? 0}</span>
          </div>
        )}
      </div>
    </>
  );
}

RoomCard.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    assetCount: PropTypes.number,
    roomCustodian: PropTypes.string,
    last_audited_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
  }).isRequired,
  columns: PropTypes.array.isRequired,
  onClick: PropTypes.func,
};

export default RoomCard;
