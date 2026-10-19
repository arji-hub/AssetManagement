import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./QRInfo.css";
import { STATUS_COLORS } from "../../data/assets";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/date";
import cictLogo from "../../assets/logo/CICTLOGO.png";
import ViewAssetDocument from "./ViewAssetDocument";

// Same COA rule as InfoCard: below threshold = ICS, at/above = PAR
const PAR_COST_THRESHOLD = 50000;

function getDocumentType(cost) {
  const amount = Number(cost);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount >= PAR_COST_THRESHOLD ? "PAR" : "ICS";
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

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
    id,
    serial_number,
    category_id,
    category_name,
    description,
    date_acquired,
    unit_value,
    cost,
    acquisition_type,
    donated_by,
    qty,
    status,
    remarks,
    asset_image_url,
    property_custodian_name,
    local_mr_name,
    room_id,
    room_name,
  } = asset;

  const statusStyle = STATUS_COLORS[status] || {
    bg: "rgba(136, 136, 136, 0.5)",
    color: "#1f1f1f",
  };

  const isDonated = acquisition_type === "donated";
  const acquisitionCost = cost ?? unit_value;
  const documentType = getDocumentType(acquisitionCost);

  const fields = [
    {
      key: "id",
      label: "Asset ID",
      icon: "fa-solid fa-hashtag",
      value: displayValue(id),
    },
    {
      key: "serial",
      label: "Serial No.",
      icon: "fa-solid fa-barcode",
      value: displayValue(serial_number),
    },
    {
      key: "category",
      label: "Category",
      icon: "fa-solid fa-tag",
      value: displayValue(category_name ?? category_id),
    },
    {
      key: "date",
      label: "Date Acquired",
      icon: "fa-solid fa-calendar-days",
      value: formatDate(date_acquired) || "—",
    },
    {
      key: "qty",
      label: "Quantity",
      icon: "fa-solid fa-boxes-stacked",
      value: displayValue(qty),
    },
    {
      key: "room",
      label: "Current Room",
      icon: "fa-solid fa-door-open",
      value: displayValue(room_name ?? room_id),
    },
    {
      key: "custodian",
      label: "Custodian",
      icon: "fa-solid fa-user-shield",
      value: displayValue(property_custodian_name),
    },
    {
      key: "local",
      label: "Local Custodian",
      icon: "fa-solid fa-user-tag",
      value: displayValue(local_mr_name),
    },
    ...(isDonated
      ? [
          {
            key: "donor",
            label: "Donated By",
            icon: "fa-solid fa-hand-holding-heart",
            value: displayValue(donated_by),
          },
        ]
      : [
          {
            key: "cost",
            label: "Acquisition Cost",
            icon: "fa-solid fa-peso-sign",
            value: formatCurrency(acquisitionCost),
          },
          {
            key: "doctype",
            label: "Document Type",
            icon: "fa-solid fa-file-signature",
            value: displayValue(documentType),
          },
        ]),
    {
      key: "remarks",
      label: "Remarks",
      icon: "fa-solid fa-note-sticky",
      value: displayValue(remarks),
      full: true,
    },
  ];

  return (
    <div className="qri-overlay">
      <div className="qri-plaque">
        {/* ── Header: seal + institutional titles ── */}
        <div className="qri-header">
          <div className="qri-header-text">
            <div className="qri-seal">
              <img src={cictLogo} alt="CICT Logo" className="qri-seal-img" />
            </div>
            <div className="qri-title">
              Bulacan State University
              <p className="qri-tag">
                College of Information and Communications Technology
              </p>
            </div>
          </div>
          <p className="qri-subtitle">BulSU Property</p>
        </div>

        {/* ── Fixed image (not part of scroll area) ── */}
        <ViewAssetDocument doc_image_url={asset_image_url}>
          {(openModal) => (
            <>
              {/* Mobile layout — visible below 370px */}
              <div className="qri-media-container-mobile">
                <div className="qri-media-row">
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

                    {asset_image_url && (
                      <span className="qri-media-hint">
                        <FontAwesomeIcon icon="fa-solid fa-magnifying-glass-plus" />
                        Tap to enlarge
                      </span>
                    )}
                  </div>

                  {status && (
                    <div
                      className="qri-status-badge-mobile"
                      style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                      }}
                    >
                      <span className="qri-status-dot-mobile" />
                      {status}
                    </div>
                  )}
                </div>

                <h2 className="qri-description">{displayValue(description)}</h2>
              </div>

              {/* Wider layout — visible at 370px and up */}
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
                  <h2 className="qri-description">
                    {displayValue(description)}
                  </h2>
                </div>
              </div>
            </>
          )}
        </ViewAssetDocument>

        {/* ── Scrollable asset info (the only scrollable section) ── */}
        <div className="qri-scroll">
          <div className="qri-scroll-watermark" aria-hidden="true" />

          <dl className="qri-fields">
            {fields.map((f) => (
              <div
                className={`qri-field${f.full ? " qri-field--full" : ""}`}
                key={f.key}
              >
                <dt className="qri-field-label">
                  <FontAwesomeIcon icon={f.icon} />
                  <span>{f.label}</span>
                </dt>
                <dd className="qri-field-value">{f.value}</dd>
              </div>
            ))}
          </dl>
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
