import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./NavButton.css";

function NavButton({ label, icon, isActive = false, onClick = () => {} }) {
  return (
    <button
      className={`nav-button ${isActive ? "nav-button-active" : ""}`}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="nav-button-label">
        {icon && <FontAwesomeIcon icon={icon} />}
        {label}
      </span>
    </button>
  );
}

NavButton.propTypes = {
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
};

export default NavButton;
