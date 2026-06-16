import React from "react";
import { useNavigate } from "react-router-dom";
import "./QRInfo.css";
import { STATUS_COLORS } from "../../../data/assets";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

function QRInfo({ asset }) {
  const navigate = useNavigate();

  const handleReturn = () => navigate("/");

  if (!asset) {
    return (
      <div className="qr-info-overlay">
        <div className="qr-info-box">
          <div className="qr-info-title">ASSET INFO</div>
          <p className="qr-info-empty">Asset information unavailable.</p>
          <button className="qr-info-return-btn" onClick={handleReturn}>
            Return
          </button>
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
    property_custodian_name,
    local_mr_name,
    room_id,
  } = asset;

  const statusStyle = STATUS_COLORS[status] || {
    bg: "rgba(136, 136, 136, 0.5)",
    color: "#1f1f1f",
  };

  return (
    <div className="qr-info-overlay">
      <div className="qr-info-box">
        <div className="qr-info-title">ASSET INFO</div>

        {/*Scrollable part na*/}
        <div className="qr-info-scroll">
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
              <span
                className="qr-info-status-badge"
                style={{
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color,
                }}
              >
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
              <span className="qr-info-value">
                {formatCurrency(unit_value)}
              </span>
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
                {displayValue(property_custodian_name)}
              </span>
            </div>

            <div className="qr-info-row">
              <span className="qr-info-label">Local MR</span>
              <span className="qr-info-value">
                {displayValue(local_mr_name)}
              </span>
            </div>
          </div>

          {remarks && (
            <div className="qr-info-remarks">
              <span className="qr-info-label">Remarks</span>
              <p className="qr-info-remarks-text">{remarks}</p>
            </div>
          )}
        </div>

        <button className="qr-info-return-btn" onClick={handleReturn}>
          Return
        </button>
      </div>
    </div>
  );
}

export default QRInfo;
