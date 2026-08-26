import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../../utils/date";
import "./RoomCard.css";

function RoomCard({ room, onClick }) {
  const navigate = useNavigate();
  const { id, name, assetCount, roomCustodian, last_audited_at } = room;

  const handleClick = () => {
    if (onClick) return onClick(room);
    navigate(`/room/${id}`);
  };

  const auditLabel = last_audited_at
    ? formatDate(last_audited_at)
    : "Not yet audited";

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div className="room-row" onClick={handleClick}>
        <div className="room-row-cell room-row-name">
          <FontAwesomeIcon
            icon="fa-solid fa-door-open"
            className="icon-door icon-door--open"
          />
          <FontAwesomeIcon
            icon="fa-solid fa-door-closed"
            className="icon-door icon-door--closed"
          />
          {name}
        </div>
        <div
          className="room-row-cell room-row-custodian"
          data-priority="medium"
        >
          {roomCustodian || "—"}
        </div>
        <div className="room-row-cell room-row-audit" data-priority="low">
          {auditLabel}
        </div>
        <div className="room-row-cell room-row-assets">
          <span className="room-row-assets-icon">
            <FontAwesomeIcon icon="fa-solid fa-box-archive" />
          </span>
          <span className="room-row-assets-label">Total Assets</span>
          <span className="room-row-assets-count">{assetCount}</span>
        </div>
      </div>

      {/* ── Mobile card ── */}
      <div className="room-card" onClick={handleClick}>
        <div className="room-card-header">
          <h3 className="room-name">{name}</h3>
        </div>
        {(roomCustodian || last_audited_at) && (
          <div className="room-card-meta">
            {roomCustodian && (
              <span className="room-card-custodian">
                <FontAwesomeIcon icon="fa-regular fa-user" />
                {roomCustodian}
              </span>
            )}
            <span className="room-card-audit">
              <FontAwesomeIcon icon="fa-solid fa-clock-rotate-left" />
              {auditLabel}
            </span>
          </div>
        )}
        <div className="room-assets">
          <span className="assets-icon-room">
            <FontAwesomeIcon icon="fa-solid fa-box-archive" />
          </span>
          <span className="room-assets-label">Total Assets</span>
          <span className="room-assets-count">{assetCount}</span>
        </div>
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
  onClick: PropTypes.func,
};

export default RoomCard;
