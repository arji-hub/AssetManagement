import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatAcquiredDate } from "../../../../data/columns/acquisitionColumns";
import "./AcquisitionCard.css";

function AcquisitionCard({ acquisition, columns }) {
  const navigate = useNavigate();
  const open = () => navigate(`/asset/acquisition/${acquisition.id}`);

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div className="acq-card-row" onClick={open}>
        {columns.map((col) => (
          <div
            key={col.key}
            className="acq-card-row-cell"
            data-priority={col.priority || "high"}
          >
            {col.render(acquisition)}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div className="acq-card" onClick={open}>
        <div className="acq-card-header">
          <span className="acq-card-type">{acquisition.acquisition_type}</span>
          <span className="acq-card-stat">
            <FontAwesomeIcon icon="fa-solid fa-boxes-stacked" />
            {acquisition.asset_count}
          </span>
        </div>
        <p className="acq-card-title">{acquisition.source || acquisition.id}</p>
        <span className="acq-card-date">
          {formatAcquiredDate(acquisition.date_acquired) || "No date"}
        </span>
      </div>
    </>
  );
}

export default AcquisitionCard;
