import React from "react";
import PropTypes from "prop-types";
import "./RoomCard.css";

function RoomCard({ name,  totalAssets = 0 }) {
  return (
    <div className="room-card">
      <div className="room-card-header">
        <h3 className="room-name">{name}</h3>
      </div>
      <div className="room-assets">
        <span className="room-assets-label">Total Assets</span>
        <span className="room-assets-count">{totalAssets}</span>
      </div>
    </div>
  );
}

RoomCard.propTypes = {
  name: PropTypes.string.isRequired,
  totalAssets: PropTypes.number.isRequired,
};

export default RoomCard;