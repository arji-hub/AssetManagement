import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import "./CustodianCard.css";

function resolveCardRoles(columns) {
  let titleAssigned = false;
  const roled = columns.map((col) => {
    if (col.card?.role) return { ...col, _cardRole: col.card.role };
    if (!titleAssigned && col.priority !== "low") {
      titleAssigned = true;
      return { ...col, _cardRole: "title" };
    }
    return { ...col, _cardRole: "meta" };
  });

  return {
    titleCol: roled.find((c) => c._cardRole === "title"),
    badgeCol: roled.find((c) => c._cardRole === "badge"),
    assetsCol: roled.find((c) => c._cardRole === "assets"),
    metaCols: roled.filter(
      (c) => c._cardRole === "meta" && c.card?.role !== "hidden",
    ),
  };
}

function CustodianCard({ custodian, columns, onClick }) {
  const navigate = useNavigate();
  const { username, fullname, email, asset_count } = custodian;
  const { titleCol, badgeCol, assetsCol, metaCols } = resolveCardRoles(columns);

  const handleClick = () => {
    if (onClick) return onClick(custodian);
    navigate(`/custodian/${username}`);
  };

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div className="custodian-row" onClick={handleClick}>
        {columns.map((col) => (
          <div
            key={col.key}
            className="custodian-row-cell"
            data-priority={col.priority || "high"}
          >
            {col.render(custodian)}
          </div>
        ))}
      </div>

      {/* ── Mobile card ── */}
      <div className="custodian-card" onClick={handleClick}>
        <div className="custodian-info">
          <div className="custodian-card-top">
            <FontAwesomeIcon
              icon="fa-regular fa-user"
              className="icon-user icon-user--default"
            />
            <FontAwesomeIcon
              icon="fa-solid fa-user"
              className="icon-user icon-user--hover"
            />
            {titleCol && <h3 className="custodian-name">{fullname}</h3>}
            {badgeCol && badgeCol.render(custodian)}
          </div>
          <div className="custodian-card-bot">
            {metaCols.map(
              (col) =>
                col.key === "email" &&
                email && (
                  <p className="custodian-email" key={col.key}>
                    {email}
                  </p>
                ),
            )}
            {assetsCol && (
              <div className="custodian-assets">
                <div className="assets-divider">
                  <span className="assets-icon">
                    <FontAwesomeIcon icon="fa-solid fa-box-archive" />
                  </span>
                  <span className="assets-label">Assets in Custody</span>
                  <span className="assets-count">{asset_count ?? 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

CustodianCard.propTypes = {
  custodian: PropTypes.shape({
    fullname: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    email: PropTypes.string,
    role: PropTypes.string.isRequired,
    asset_count: PropTypes.number,
  }).isRequired,
  columns: PropTypes.array.isRequired,
  onClick: PropTypes.func,
};

export default CustodianCard;
