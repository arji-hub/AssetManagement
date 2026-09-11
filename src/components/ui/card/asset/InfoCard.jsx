import React from "react";
import { useNavigate } from "react-router-dom";
import { STATUS_COLORS } from "../../../../data/assets";
import { formatCurrency } from "../../../../utils/formatCurrency";
import ViewAssetDocument from "../../../modal/ViewAssetDocument";
import { formatDate } from "../../../../utils/date";
import "./InfoCard.css";

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

function DetailItem({ label, value, description, onClick, className = "" }) {
  return (
    <div
      className={`info-card-detail-item ${
        onClick ? "info-card-detail-item--clickable" : ""
      } ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="info-card-detail-label">{label}</span>
      <span className="info-card-detail-value">{value || "—"}</span>
      {description && (
        <span className="info-card-detail-desc">{description}</span>
      )}
    </div>
  );
}

function InfoCard({ asset }) {
  const navigate = useNavigate();
  const isDonated = asset.acquisition_type === "donated";

  return (
    <div className="info-card">
      {/* ── Header band ── */}
      <div className="info-card-header">
        <span className="info-card-category-label">
          {asset.category_id || "Uncategorized"}
        </span>

        <span className="info-card-date-label">
          {formatDate(asset.date_acquired) || "----"}
        </span>
      </div>

      <div className="info-card-body">
        {/* ── Left: description + field grid ── */}
        <div className="info-card-detail-col">
          <div className="info-card-title-block">
            <span className="info-card-title-label">
              <StatusBadge status={asset.status} />
            </span>
            <h1 className="info-card-description">
              {asset.description || "—"}
            </h1>
          </div>

          <div className="info-card-details-grid">
            <DetailItem
              label="Asset ID"
              value={asset.id}
              description="Unique identifier assigned to this asset for tracking."
            />
            <DetailItem
              label="Serial Number"
              value={asset.serial_number}
              description="Manufacturer-issued serial number, used for warranty and identification."
            />
            <DetailItem
              label="Quantity"
              value={asset.qty ?? "—"}
              description="Number of physical units this record represents."
            />
            <DetailItem
              label="Current Location"
              value={asset.room_name}
              description="Room or area where this asset is currently kept."
              onClick={
                asset.room_id
                  ? () => navigate(`/room/${asset.room_id}`)
                  : undefined
              }
            />
            <DetailItem
              label="Custodian"
              value={asset.property_custodian_name}
              description="Person accountable for this asset's condition and location."
              onClick={
                asset.property_custodian
                  ? () =>
                      navigate(
                        `/custodian/${asset.property_custodian_username}`,
                      )
                  : undefined
              }
            />
            <DetailItem
              label="Local Custodian"
              value={asset.local_mr_name}
              description="Secondary custodian assigned for day-to-day handling."
              onClick={
                asset.local_mr
                  ? () => navigate(`/custodian/${asset.local_mr_username}`)
                  : undefined
              }
            />
            {isDonated ? (
              <DetailItem
                label="Donated By"
                value={asset.donated_by}
                description="Individual or organization that donated this asset."
              />
            ) : (
              <DetailItem
                label="Acquisition Cost"
                value={formatCurrency(asset.cost)}
                description="Purchase price recorded at the time of acquisition."
              />
            )}
            <DetailItem
              label="Remarks"
              value={asset.remarks}
              description="Additional notes or maintenance history for this asset."
              className="info-card-detail-item--full"
            />
          </div>
        </div>

        {/* ── Right: asset image ── */}
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
    </div>
  );
}

export default InfoCard;
