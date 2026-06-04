import PropTypes from "prop-types";
import "./NavButton.css";

function NavButton({ label, icon, isActive = false, onClick = () => {} }) {
  return (
    <button
      className={`nav-button ${isActive ? "nav-button-active" : ""}`}
      onClick={isActive ? undefined : onClick}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="nav-button-label">{label}</span>
    </button>
  );
}

NavButton.propTypes = {
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
};

export default NavButton;
