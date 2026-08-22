import React from "react";
import { formatDate } from "../../../utils/date";
import "./TransferRoomCard.css";

function TransferRoomCard({ request }) {
  return (
    <>
      {/* Desktop / tablet grid row */}
      <div className="transfer-card-row-room">
        <div className="transfer-card-cell transfer-card-id">
          {request.asset_id}
        </div>
        <div className="transfer-card-cell transfer-card-desc">
          {request.asset_name}
        </div>
        <div className="transfer-card-cell">{request.room_from || "—"}</div>
        <div className="transfer-card-cell">{request.move_to}</div>
        <div className="transfer-card-cell">
          {formatDate(request.created_at)}
        </div>
      </div>

      {/* Mobile card */}
      <div className="transfer-card-room-mobile">
        <div className="transfer-card-room-mobile-header">
          <span className="transfer-card-room-mobile-id">
            {request.asset_id}
          </span>
          <span className="transfer-card-room-mobile-date">
            {formatDate(request.created_at)}
          </span>
        </div>

        {request.asset_name && (
          <p className="transfer-card-room-mobile-desc">{request.asset_name}</p>
        )}

        <div className="transfer-card-room-mobile-route">
          <span className="transfer-card-room-mobile-room">
            {request.room_from || "—"}
          </span>
          <span className="transfer-card-room-mobile-arrow">→</span>
          <span className="transfer-card-room-mobile-room transfer-card-room-mobile-room--to">
            {request.move_to}
          </span>
        </div>
      </div>
    </>
  );
}

export default TransferRoomCard;
