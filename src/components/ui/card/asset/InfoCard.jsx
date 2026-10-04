import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHashtag,
  faBarcode,
  faBoxesStacked,
  faDoorOpen,
  faUserShield,
  faUserTag,
  faHandHoldingHeart,
  faPesoSign,
  faNoteSticky,
  faFileSignature,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { STATUS_COLORS } from "../../../../data/assets";
import { formatCurrency } from "../../../../utils/formatCurrency";
import ViewAssetDocument from "../../../modal/ViewAssetDocument";
import { formatDate } from "../../../../utils/date";
import "./InfoCard.css";

// COA threshold: property costing below this is semi-expendable (ICS);
// at or above it is PPE (PAR). Adjust here if the rule changes.
const PAR_COST_THRESHOLD = 50000;

function getDocumentType(cost) {
  const amount = Number(cost);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount >= PAR_COST_THRESHOLD ? "PAR" : "ICS";
}

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

function DetailItem({ label, value, icon, onClick, className = "" }) {
  return (
    <div
      className={`info-card-detail-item ${
        onClick ? "info-card-detail-item--clickable" : ""
      } ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="info-card-detail-icon" aria-hidden="true">
        <FontAwesomeIcon icon={icon} />
      </span>
      <div className="info-card-detail-text">
        <span className="info-card-detail-label">{label}</span>
        <span className="info-card-detail-value">{value || "—"}</span>
      </div>
    </div>
  );
}

function InfoCard({ asset }) {
  const navigate = useNavigate();
  const isDonated = asset.acquisition_type === "donated";
  const documentType = getDocumentType(asset.cost);

  return (
    <div className="info-card">
      {/* ── Header band ── */}
      <div className="info-card-header">
        <span className="info-card-category-label">
          {asset.category_name || "Uncategorized"}
        </span>

        <span className="info-card-date-label">
          {formatDate(asset.date_acquired) || "----"}
        </span>
      </div>

      <div className="info-card-body">
        {/* ── Top row: title block (left) + image (right). Image stacks on top when narrow ── */}
        <div className="info-card-top">
          <div className="info-card-title-block">
            <span className="info-card-title-label">
              <StatusBadge status={asset.status} />
            </span>
            <h1 className="info-card-description">
              {asset.description || "—"}
            </h1>
          </div>

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

        {/* ── Below: full-width field grid ── */}
        <div className="info-card-details-grid">
          <DetailItem label="Asset ID" value={asset.id} icon={faHashtag} />
          <DetailItem
            label="Serial Number"
            value={asset.serial_number}
            icon={faBarcode}
          />
          <DetailItem
            label="Quantity"
            value={asset.qty ?? "—"}
            icon={faBoxesStacked}
          />
          <DetailItem
            label="Current Room"
            value={asset.room_name}
            icon={faDoorOpen}
            onClick={
              asset.room_id
                ? () => navigate(`/room/${asset.room_id}`)
                : undefined
            }
          />
          <DetailItem
            label="Custodian"
            value={asset.property_custodian_name}
            icon={faUserShield}
            onClick={
              asset.property_custodian
                ? () =>
                    navigate(`/custodian/${asset.property_custodian_username}`)
                : undefined
            }
          />
          <DetailItem
            label="Local Custodian"
            value={asset.local_mr_name}
            icon={faUserTag}
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
              icon={faHandHoldingHeart}
            />
          ) : (
            <>
              <DetailItem
                label="Acquisition Cost"
                value={formatCurrency(asset.cost)}
                icon={faPesoSign}
              />
              <DetailItem
                label="Document Type"
                value={documentType}
                icon={faFileSignature}
              />
            </>
          )}
          <DetailItem
            label="Remarks"
            value={asset.remarks}
            icon={faNoteSticky}
            className="info-card-detail-item--full"
          />
        </div>
      </div>
    </div>
  );
}

export default InfoCard;
