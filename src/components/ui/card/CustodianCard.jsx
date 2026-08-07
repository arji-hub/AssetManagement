import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { getRole } from "../../../utils/role";
import { ROLES_COLOR } from "../../../data/roles";
import "./CustodianCard.css";

function CustodianCard({ custodian, onClick }) {
  const navigate = useNavigate();
  const {
    fullname,
    username,
    email,
    role: classification,
    asset_count,
  } = custodian;

  const role = getRole(classification);
  const roleColor = ROLES_COLOR[classification];

  const handleClick = () => {
    if (onClick) return onClick(custodian);
    navigate(`/custodian/${username}`);
  };

  const badgeStyle = {
    background: roleColor?.background || "rgba(59, 114, 68, 0.3)",
    color: roleColor?.text || "#004700",
  };

  return (
    <>
      {/* ── Desktop / tablet row ── */}
      <div className="custodian-row" onClick={handleClick}>
        <div className="custodian-row-cell custodian-row-name">
          <FontAwesomeIcon
            icon="fa-regular fa-user"
            className="icon-user icon-user--default"
          />
          <FontAwesomeIcon
            icon="fa-solid fa-user"
            className="icon-user icon-user--hover"
          />
          {fullname}
        </div>
        <div
          className="custodian-row-cell custodian-row-email"
          data-priority="low"
        >
          {email || "—"}
        </div>
        <div
          className="custodian-row-cell custodian-row-role"
          data-priority="medium"
        >
          <span className="custodian-badge" style={badgeStyle}>
            {role}
          </span>
        </div>
        <div className="custodian-row-cell custodian-row-assets">
          <span className="custodian-row-assets-icon">
            <FontAwesomeIcon icon="fa-solid fa-box-archive" />
          </span>
          <span className="custodian-row-assets-label">Assets in Custody</span>
          <span className="custodian-row-assets-count">{asset_count ?? 0}</span>
        </div>
      </div>

      {/* ── Mobile card ── */}
      <div className="custodian-card" onClick={handleClick}>
        <div className="custodian-info">
          <div className="custodian-card-top">
            <FontAwesomeIcon icon="fa-regular fa-user" />
            <h3 className="custodian-name">{fullname}</h3>
            <span className="custodian-badge" style={badgeStyle}>
              {role}
            </span>
          </div>
          <div className="custodian-card-bot">
            {email && <p className="custodian-email">{email}</p>}
            <div className="custodian-assets">
              <div className="assets-divider">
                <span className="assets-icon">
                  <FontAwesomeIcon icon="fa-solid fa-box-archive" />
                </span>
                <span className="assets-label">Assets in Custody</span>
                <span className="assets-count">{asset_count ?? 0}</span>
              </div>
            </div>
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
  onClick: PropTypes.func,
};

export default CustodianCard;
