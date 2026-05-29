import PropTypes from "prop-types";
import "./NavButton.css";

function NavButton({ label, icon, isActive, onClick }) {
  return (
    <button
      className={`nav-button ${isActive ? "nav-button-active" : ""}`}
      onClick={isActive ? undefined : onClick}
      disabled={isActive}
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

NavButton.defaultProps = {
  isActive: false,
  onClick: () => {},
};

export default NavButton;
