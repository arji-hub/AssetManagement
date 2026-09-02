// src/components/ui/card/audit/AuditCustodianCard.jsx
import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./AuditCustodianCard.css";

function AuditCustodianCard({ custodian, columns, onClick }) {
  const displayName = custodian.fullname;

  let titleAssigned = false;
  const roledColumns = columns.map((col) => {
    if (col.card?.role) return { ...col, _cardRole: col.card.role };
    if (!titleAssigned && col.priority !== "low") {
      titleAssigned = true;
      return { ...col, _cardRole: "title" };
    }
    return { ...col, _cardRole: "meta" };
  });

  const titleCol = roledColumns.find((c) => c._cardRole === "title");
  const dateCol = roledColumns.find((c) => c._cardRole === "date");
  const assetsCol = roledColumns.find((c) => c._cardRole === "assets");
  const actionCol = roledColumns.find((c) => c._cardRole === "action");
  const metaCols = roledColumns.filter(
    (c) => c._cardRole === "meta" && c.card?.role !== "hidden",
  );

  const handleClick = () => {
    onClick?.(custodian);
  };

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div className="custodian-audit-row" onClick={handleClick}>
        {roledColumns.map((col) => (
          <div
            key={col.key}
            className="custodian-audit-row-cell"
            data-priority={col.priority || "high"}
            onClick={
              col._cardRole === "action"
                ? (e) => e.stopPropagation()
                : undefined
            }
          >
            {col.render(custodian)}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div className="custodian-audit-card" onClick={handleClick}>
        <div className="custodian-audit-card-header">
          {titleCol && <h3 className="custodian-audit-name">{displayName}</h3>}
        </div>

        {(metaCols.length > 0 || dateCol) && (
          <div className="custodian-audit-card-meta">
            {metaCols.map((col) => (
              <span className="custodian-audit-card-role" key={col.key}>
                {col.card?.icon && <FontAwesomeIcon icon={col.card.icon} />}
                {custodian.role || "—"}
              </span>
            ))}
            {dateCol && (
              <span className="custodian-audit-card-audit">
                <FontAwesomeIcon icon="fa-solid fa-clock-rotate-left" />
                {dateCol.render(custodian)}
              </span>
            )}
          </div>
        )}

        {assetsCol && (
          <div className="custodian-audit-assets">
            <span className="assets-icon-custodian-audit">
              <FontAwesomeIcon icon="fa-solid fa-box-archive" />
            </span>
            <span className="custodian-audit-assets-label">Total Assets</span>
            <span className="custodian-audit-assets-count">
              {custodian.asset_count ?? 0}
            </span>
          </div>
        )}

        {actionCol && (
          <div
            className="custodian-audit-card-form"
            onClick={(e) => e.stopPropagation()}
          >
            {actionCol.render(custodian)}
          </div>
        )}
      </div>
    </>
  );
}

AuditCustodianCard.propTypes = {
  custodian: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string,
    fullname: PropTypes.string,
    role: PropTypes.string,
    asset_count: PropTypes.number,
    audited_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
    last_audited_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
  }).isRequired,
  columns: PropTypes.array.isRequired,
  onClick: PropTypes.func,
};

export default AuditCustodianCard;
