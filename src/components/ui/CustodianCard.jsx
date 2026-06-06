import PropTypes from "prop-types";
import "./CustodianCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ROLES } from "../../data/roles";
import { useNavigate } from "react-router-dom";

function getRole(classification) {
  if (classification === ROLES.PARTTIME) return "Part Time";
  if (classification === ROLES.FULLTIME) return "Full Time";
  return "unknown";
}

function CustodianCard({ name, classification, totalAssets, username }) {
  const role = getRole(classification);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/custodian/${username}`);
  };

  return (
    <div className="custodian-card" onClick={handleClick}>
      <div className="profile-pic">
        <FontAwesomeIcon icon="fa-solid fa-circle-user" />
      </div>
      <div className="custodian-info">
        <h3 className="custodian-name">{name}</h3>

        <div className="custodian-assets">
          <span className="custodian-badge">{role}</span>

          <div className="assets-divider">
            <span className="assets-icon">
              <FontAwesomeIcon icon="fa-solid fa-box-archive" />
            </span>
            <span className="assets-label">Assets in Custody</span>
            <span className="assets-count">{totalAssets}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

CustodianCard.propTypes = {
  name: PropTypes.string.isRequired,
  classification: PropTypes.string.isRequired,
  totalAssets: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
};

export default CustodianCard;
