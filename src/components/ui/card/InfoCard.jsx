import React from "react";
import { useNavigate } from "react-router-dom";
import { STATUS_COLORS } from "../../../data/assets";
import LabelCard from "./LabelCard";
import { formatCurrency } from "../../../utils/formatCurrency";
import ViewAssetDocument from "../modal/ViewAssetDocument";
import "./InfoCard.css";
import { formatDate } from "../../../utils/date";

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
  const navigate = useNavigate();
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
          <LabelCard
            label="Current Location"
            value={asset.room_id}
            onClick={
              asset.room_id
                ? () => navigate(`/room/${asset.room_id}`)
                : undefined
            }
            style={asset.room_id ? { cursor: "pointer" } : undefined}
          />
          <LabelCard
            label="Custodian"
            value={asset.property_custodian_name}
            onClick={
              asset.property_custodian
                ? () =>
                    navigate(`/custodian/${asset.property_custodian_username}`)
                : undefined
            }
            style={asset.property_custodian ? { cursor: "pointer" } : undefined}
          />
          <LabelCard
            label="Local Custodian"
            value={asset.local_mr_name}
            onClick={
              asset.local_mr
                ? () => navigate(`/custodian/${asset.local_mr_username}`)
                : undefined
            }
            style={asset.local_mr ? { cursor: "pointer" } : undefined}
          />
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
