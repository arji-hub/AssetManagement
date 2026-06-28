import React from "react";
import { formatDate } from "../../../utils/date";
import "./TransferRoomCard.css";

function TransferRoomCard({ request }) {
  return (
    <div className="transfer-card-row-room">
      <div className="transfer-card-cell transfer-card-id">
        {request.asset_id}
      </div>
      <div className="transfer-card-cell transfer-card-desc">
        {request.asset_name}
      </div>
      <div className="transfer-card-cell">{request.room_from || "—"}</div>
      <div className="transfer-card-cell">{request.move_to}</div>
      <div className="transfer-card-cell">{formatDate(request.created_at)}</div>
    </div>
  );
}

export default TransferRoomCard;
