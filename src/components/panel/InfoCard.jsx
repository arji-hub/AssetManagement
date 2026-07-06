import React from "react";
import { STATUS_COLORS } from "../../data/assets";
import LabelCard from "../ui/card/LabelCard";
import { formatCurrency } from "../../utils/formatCurrency";
import ViewAssetDocument from "../ui/modal/ViewAssetDocument";
import "./InfoCard.css";
import { formatDate } from "../../utils/date";

function StatusBadge({ status }) {
  if (!status) return null;
  const style = STATUS_COLORS[status] || {
    bg: "rgba(136,136,136,0.7)",
    color: "#1f1f1f",
  };
  return (
    <span
      className="info-card-status-badge"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}

function InfoCard({ asset }) {
  return (
    <div className="info-card">
      {/* Center: main info */}
      <div className="info-card-detail-col">
        <div className="info-card-category-row">
          <span className="info-card-category-label">
            {asset.category_id || "Uncategorized"}
          </span>
          <StatusBadge status={asset.status} />
          <span className="info-card-date-label">
            {formatDate(asset.date_acquired) || "----"}
          </span>
        </div>

        <div className="info-card-id-row">
          <h1 className="info-card-description">{asset.description || "—"}</h1>
          <div className="info-card-id-item">
            <span className="info-card-id-label">Asset ID</span>
            <span className="info-card-id-value">{asset.id}</span>
          </div>
          <div className="info-card-id-item">
            <span className="info-card-id-label">Serial Number</span>
            <span className="info-card-id-value">
              {asset.serial_number || "—"}
            </span>
          </div>
          <div className="info-card-id-item">
            <span className="info-card-id-label">Qty</span>
            <span className="info-card-id-value">{asset.qty ?? "—"}</span>
          </div>
        </div>

        <div className="info-card-labels-grid">
          <LabelCard label="Current Location" value={asset.room_id} />
          <LabelCard label="Custodian" value={asset.property_custodian_name} />
          <LabelCard label="Local Custodian" value={asset.local_mr_name} />
          <LabelCard
            label="Acquisition Cost"
            value={formatCurrency(asset.unit_value)}
          />
          <LabelCard
            label="Remarks"
            value={asset.remarks}
            className="remarks-card"
          />
        </div>
      </div>

      {/* Right: asset image */}
      <div className="info-card-image-col">
        <ViewAssetDocument doc_image_url={asset.asset_image_url}>
          {(openModal) =>
            asset.asset_image_url ? (
              <img
                src={asset.asset_image_url}
                alt={asset.description || "Asset"}
                className="info-card-main-img"
                onClick={openModal}
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <div className="info-card-main-img-placeholder">
                <i className="ti ti-photo" aria-hidden="true" />
                <span>IMAGE</span>
              </div>
            )
          }
        </ViewAssetDocument>
      </div>
    </div>
  );
}

export default InfoCard;
