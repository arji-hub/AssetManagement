import React from "react";
import PropTypes from "prop-types";
import "./RoomCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

function RoomCard({ roomName, roomID, totalAssets = 0 }) {
  const navigate = useNavigate();
  console.log("Id", roomID, "RoomName", roomName, "Total", totalAssets);
  return (
    <div className="room-card" onClick={() => navigate(`/room/${roomID}`)}>
      <div className="room-card-header">
        <h3 className="room-name">{roomName}</h3>
      </div>
      <div className="room-assets">
        <span className="assets-icon-room">
          <FontAwesomeIcon icon="fa-solid fa-box-archive" />
        </span>
        <span className="room-assets-label">Total Assets</span>
        <span className="room-assets-count">{totalAssets}</span>
      </div>
    </div>
  );
}

RoomCard.propTypes = {
  roomName: PropTypes.string.isRequired,
  totalAssets: PropTypes.number.isRequired,
};

export default RoomCard;
