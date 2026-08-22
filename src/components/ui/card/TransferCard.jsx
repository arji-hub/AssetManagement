import React from "react";
import { Status } from "../status/assetStatus";
import { formatDate } from "../../../utils/date";
import { TRANSFER_TYPE_LABELS } from "../../../data/transfer";
import "./TransferCard.css";

function TransferCard({ request, onClick }) {
  return (
    <>
      {/* Desktop / tablet grid row */}
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
        <div className="transfer-card-cell">
          {formatDate(request.created_at)}
        </div>
      </div>

      {/* Mobile card */}
      <div className="transfer-card-mobile" onClick={() => onClick(request)}>
        <div className="transfer-card-mobile-header">
          <Status status={request.status} />
          <span className="transfer-card-mobile-date">
            {formatDate(request.created_at)}
          </span>
        </div>

        <p className="transfer-card-mobile-title">{request.asset_id}</p>
        {request.asset_description && (
          <p className="transfer-card-mobile-desc">
            {request.asset_description}
          </p>
        )}

        <div className="transfer-card-mobile-meta">
          <span className="transfer-card-mobile-meta-item">
            {TRANSFER_TYPE_LABELS[request.type] ?? request.type}
          </span>
          <span className="transfer-card-mobile-meta-item">
            {request.requested_by_name}
          </span>
        </div>
      </div>
    </>
  );
}

export default TransferCard;
