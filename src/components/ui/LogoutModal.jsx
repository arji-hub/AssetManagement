import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import "./LogoutModal.css";

function LogoutModal({ isOpen, onConfirm, onCancel, userEmail = "" }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <FontAwesomeIcon icon={faArrowRightFromBracket} flip="horizontal" />
        </div>

        <h2 className="modal-title">Confirm Logout</h2>
        <p className="modal-message">Are you sure you want to logout?</p>
        <p className="modal-email">{userEmail}</p>

        <div className="modal-actions">
          <button className="modal-btn-confirm" onClick={onConfirm}>
            Logout
          </button>
          <button className="modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

LogoutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  userEmail: PropTypes.string,
};

export default LogoutModal;
