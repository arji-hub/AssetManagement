import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./QRInfo.css";
import { STATUS_COLORS } from "../../../data/assets";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/date";
import cictLogo from "../../../assets/CICTLOGO.png";
import ViewAssetDocument from "../modal/ViewAssetDocument";

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

const FIELD_ICONS = {
  serial: "fa-solid fa-barcode",
  category: "fa-solid fa-tag",
  date: "fa-solid fa-calendar-days",
  value: "fa-solid fa-coins",
  qty: "fa-solid fa-layer-group",
  room: "fa-solid fa-door-open",
  custodian: "fa-solid fa-user-shield",
};

function QRInfo({ asset }) {
  const navigate = useNavigate();

  const handleReturn = () => navigate("/");

  if (!asset) {
    return (
      <div className="qri-overlay">
        <div className="qri-plaque qri-plaque--empty">
          <div className="qri-empty-icon">
            <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
          </div>
          <h2 className="qri-empty-title">Asset Not Found</h2>
          <p className="qri-empty-text">
            We couldn't load information for this asset.
          </p>
          <button className="qri-btn" onClick={handleReturn}>
            <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
            Return Home
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
    room_id,
  } = asset;

  const statusStyle = STATUS_COLORS[status] || {
    bg: "rgba(136, 136, 136, 0.5)",
    color: "#1f1f1f",
  };

  const fields = [
    { key: "serial", label: "Serial No.", value: displayValue(serial_number) },
    { key: "category", label: "Category", value: displayValue(category_id) },
    { key: "date", label: "Date Acquired", value: formatDate(date_acquired) },
    { key: "value", label: "Unit Value", value: formatCurrency(unit_value) },
    { key: "qty", label: "Quantity", value: displayValue(qty) },
    { key: "room", label: "Room", value: displayValue(room_id) },
    {
      key: "custodian",
      label: "Property Custodian",
      value: displayValue(property_custodian_name),
    },
  ];

  return (
    <div className="qri-overlay">
      <div className="qri-plaque">
        {/* ── Header: seal + institutional titles ── */}
        <div className="qri-header">
          <div className="qri-seal">
            <img src={cictLogo} alt="CICT Logo" className="qri-seal-img" />
          </div>
          <div className="qri-header-text">
            <div className="qri-title">
              <h2>Bulacan State University</h2>
              <p className="qri-tag">BulSU Property</p>
            </div>
            <p className="qri-subtitle">
              College of Information and Communications Technology
            </p>
          </div>
        </div>

        {/* ── Fixed image (not part of scroll area) ── */}
        <ViewAssetDocument doc_image_url={asset_image_url}>
          {(openModal) => (
            <div className="qri-media-container">
              <div
                className="qri-media"
                onClick={asset_image_url ? openModal : undefined}
                role={asset_image_url ? "button" : undefined}
                tabIndex={asset_image_url ? 0 : undefined}
              >
                {asset_image_url ? (
                  <img
                    src={asset_image_url}
                    alt={description || "Asset image"}
                    className="qri-media-img"
                  />
                ) : (
                  <div className="qri-media-placeholder">
                    <FontAwesomeIcon icon="fa-solid fa-image" />
                    <span>No Image</span>
                  </div>
                )}

                {status && (
                  <span
                    className="qri-status-badge"
                    style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                    }}
                  >
                    <span className="qri-status-dot" />
                    {status}
                  </span>
                )}

                {asset_image_url && (
                  <span className="qri-media-hint">
                    <FontAwesomeIcon icon="fa-solid fa-magnifying-glass-plus" />
                    Tap to enlarge
                  </span>
                )}
              </div>
              <div className="qri-description-container">
                <h2 className="qri-description">{displayValue(description)}</h2>
              </div>
            </div>
          )}
        </ViewAssetDocument>

        {/* ── Scrollable asset info (the only scrollable section) ── */}
        <div className="qri-scroll">
          <div className="qri-scroll-watermark" aria-hidden="true" />

          <dl className="qri-fields">
            {fields.map((f) => (
              <div className="qri-field" key={f.key}>
                <dt className="qri-field-label">
                  <FontAwesomeIcon icon={FIELD_ICONS[f.key]} />
                  <span>{f.label}</span>
                </dt>
                <dd className="qri-field-value">{f.value}</dd>
              </div>
            ))}
          </dl>

          {remarks && (
            <div className="qri-remarks">
              <div className="qri-remarks-label">
                <FontAwesomeIcon icon="fa-solid fa-note-sticky" />
                <span>Remarks</span>
              </div>
              <p className="qri-remarks-text">{remarks}</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="qri-footer">
          <button className="qri-btn" onClick={handleReturn}>
            <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
            Return
          </button>
        </div>
      </div>
    </div>
  );
}

export default QRInfo;
