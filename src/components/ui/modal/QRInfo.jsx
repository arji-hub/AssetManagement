import React from "react";
import "./QRInfo.css";

const STATUS_STYLES = {
  Working: "qr-info-status-good",
  "For Repair": "qr-info-status-warn",
  "For Disposal": "qr-info-status-bad",
  Lost: "qr-info-status-bad",
};

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "—";
  try {
    const date =
      typeof value === "object" && value.toDate
        ? value.toDate()
        : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

function QRInfo({ asset }) {
  if (!asset) {
    return (
      <div className="qr-info-overlay">
        <div className="qr-info-box">
          <div className="qr-info-title">ASSET INFO</div>
          <p className="qr-info-empty">Asset information unavailable.</p>
        </div>
      </div>
    );
  }

  const {
    serial_number,
    category_id,
    description,
    date_acquired,
    unit_value,
    qty,
    status,
    remarks,
    asset_image_url,
    property_custodian,
    local_mr,
    room_id,
  } = asset;

  const statusClass = STATUS_STYLES[status] || "qr-info-status-default";

  return (
    <div className="qr-info-overlay">
      <div className="qr-info-box">
        <div className="qr-info-title">ASSET INFO</div>

        <div className="qr-info-image-wrapper">
          {asset_image_url ? (
            <img
              src={asset_image_url}
              alt={description || "Asset image"}
              className="qr-info-image"
            />
          ) : (
            <div className="qr-info-image-placeholder">No Image</div>
          )}
          {status && (
            <span className={`qr-info-status-badge ${statusClass}`}>
              {status}
            </span>
          )}
        </div>

        <h3 className="qr-info-description">{displayValue(description)}</h3>

        <div className="qr-info-grid">
          <div className="qr-info-row">
            <span className="qr-info-label">Serial No.</span>
            <span className="qr-info-value">
              {displayValue(serial_number)}
            </span>
          </div>

          <div className="qr-info-row">
            <span className="qr-info-label">Category</span>
            <span className="qr-info-value">{displayValue(category_id)}</span>
          </div>

          <div className="qr-info-row">
            <span className="qr-info-label">Date Acquired</span>
            <span className="qr-info-value">{formatDate(date_acquired)}</span>
          </div>

          <div className="qr-info-row">
            <span className="qr-info-label">Unit Value</span>
            <span className="qr-info-value">{formatCurrency(unit_value)}</span>
          </div>

          <div className="qr-info-row">
            <span className="qr-info-label">Quantity</span>
            <span className="qr-info-value">{displayValue(qty)}</span>
          </div>

          <div className="qr-info-row">
            <span className="qr-info-label">Room</span>
            <span className="qr-info-value">{displayValue(room_id)}</span>
          </div>

          <div className="qr-info-row">
            <span className="qr-info-label">Property Custodian</span>
            <span className="qr-info-value">
              {displayValue(property_custodian)}
            </span>
          </div>

          <div className="qr-info-row">
            <span className="qr-info-label">Local MR</span>
            <span className="qr-info-value">{displayValue(local_mr)}</span>
          </div>
        </div>

        {remarks && (
          <div className="qr-info-remarks">
            <span className="qr-info-label">Remarks</span>
            <p className="qr-info-remarks-text">{remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRInfo;