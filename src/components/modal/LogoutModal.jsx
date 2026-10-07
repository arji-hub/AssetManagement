import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import "./LogoutModal.css";

function LogoutModal({ isOpen, onConfirm, onCancel, userEmail = "" }) {
  // Close on Escape + lock background scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay-logout"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <FontAwesomeIcon icon={faArrowRightFromBracket} flip="horizontal" />
        </div>

        <h2 id="logout-modal-title" className="modal-title">
          Confirm Logout
        </h2>
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
    </div>,
    document.body,
  );
}

LogoutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  userEmail: PropTypes.string,
};

export default LogoutModal;
