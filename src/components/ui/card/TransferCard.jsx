import React from "react";
import { Status } from "../status/assetStatus";
import { formatDate } from "../../../utils/date";
import { TRANSFER_TYPE_LABELS } from "../../../data/transfer";
import "./TransferCard.css";

function TransferCard({ request, onClick }) {
  return (
    <div className="transfer-card-row" onClick={() => onClick(request)}>
      <div className="transfer-card-cell transfer-card-id">
        {request.asset_id}
      </div>
      <div className="transfer-card-cell transfer-card-desc">
        {request.asset_description}
      </div>
      <div className="transfer-card-cell">
        {TRANSFER_TYPE_LABELS[request.type] ?? request.type}
      </div>
      <div className="transfer-card-cell">{request.requested_by_name}</div>
      <div className="transfer-card-cell transfer-card-status">
        <Status status={request.status} />
      </div>
      <div className="transfer-card-cell">{formatDate(request.created_at)}</div>
    </div>
  );
}

export default TransferCard;
