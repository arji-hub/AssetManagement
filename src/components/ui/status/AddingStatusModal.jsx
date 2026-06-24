import PropTypes from "prop-types";
import "./AddingStatusModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function AddingStatusModal({ title, status, errorMessage, onClose }) {
  return (
    <div className="status-overlay">
      <div className="status-container">
        {/* ── Loading ── */}
        {status === "loading" && (
          <>
            <div className="status-spinner" />
            <h2 className="status-title">Adding {title}</h2>
            <p className="status-message">
              Please wait while we set up the new {title.toLowerCase()}...
            </p>
          </>
        )}

        {/* ── Success ── */}
        {status === "success" && (
          <>
            <div className="status-icon status-icon--success">
              <FontAwesomeIcon icon="fa-solid fa-circle-check" />
            </div>
            <h2 className="status-title">{title} Added</h2>
            <p className="status-message">
              The new {title.toLowerCase()} has been created successfully.
            </p>
            <button
              className="status-btn status-btn--success"
              onClick={onClose}
            >
              Done
            </button>
          </>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <>
            <div className="status-icon status-icon--error">
              <FontAwesomeIcon icon="fa-solid fa-circle-xmark" />
            </div>
            <h2 className="status-title">Something Went Wrong</h2>
            <p className="status-message status-message--error">
              {errorMessage ||
                "An unexpected error occurred. Please try again."}
            </p>
            <button className="status-btn status-btn--error" onClick={onClose}>
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

AddingStatusModal.propTypes = {
  title: PropTypes.string.isRequired,
  status: PropTypes.oneOf(["loading", "success", "error"]).isRequired,
  errorMessage: PropTypes.string,
  onClose: PropTypes.func,
};

export default AddingStatusModal;