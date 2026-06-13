import PropTypes from "prop-types";
import "./CustodianModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useCustodianRegistration from "../../../hooks/useCustodianRegistration";

function CustodianModal({ onClose, onSubmit, isSubmitting = false }) {
  const { form, errors, isComplete, handleChange, handleSubmit } =
    useCustodianRegistration({ onSubmit, onClose });

  return (
    <div className="modal-overlay">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="modal-header">
          <h2 className="modal-title">Add New Custodian</h2>
          <button className="modal-close" onClick={onClose}>
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
          {/* Row 1: Email | Username*/}
          <div className="modal-row">
            <div className="modal-field">
              <label htmlFor="email">E-MAIL</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>
            <div className="modal-field">
              <label htmlFor="username">USERNAME</label>
              <input
                id="username"
                name="user_name"
                type="text"
                placeholder="Enter username"
                value={form.user_name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 2: First Name + Middle Name */}
          <div className="modal-row">
            <div className="modal-field">
              <label htmlFor="firstName">FIRST NAME</label>
              <input
                id="firstName"
                name="first_name"
                type="text"
                placeholder="Enter first name"
                value={form.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="modal-field">
              <label htmlFor="middleName">MIDDLE NAME</label>
              <input
                id="middleName"
                name="middle_name"
                type="text"
                placeholder="Enter text"
                value={form.middle_name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3: Last Name + Classification */}
          <div className="modal-row">
            <div className="modal-field">
              <label htmlFor="lastName">LAST NAME</label>
              <input
                id="lastName"
                name="last_name"
                type="text"
                placeholder="Enter last name"
                value={form.last_name}
                onChange={handleChange}
              />
            </div>
            <div className="modal-field">
              <label htmlFor="classification">CLASSIFICATION</label>
              <select
                id="classification"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="fulltime">FULL-TIME</option>
                <option value="parttime">PART-TIME</option>
              </select>
            </div>
          </div>

          {/* Row 4: Password + Confirm Password */}
          <div className="modal-row">
            <div className="modal-field">
              <label htmlFor="password">PASSWORD</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>
            <div className="modal-field">
              <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
              <input
                id="confirmPassword"
                name="confirm_password"
                type="password"
                placeholder="Re-enter password"
                value={form.confirm_password}
                onChange={handleChange}
                className={errors.confirm_password ? "input-error" : ""}
              />
              {errors.confirm_password && (
                <span className="field-error">{errors.confirm_password}</span>
              )}
            </div>
          </div>

          {/* ── Info box ── */}
          <div className="modal-info">
            <FontAwesomeIcon
              icon="fa-solid fa-circle-info"
              className="info-icon"
            />
            <p className="info-text">
              Enter complete and accurate details to register a new custodian
              responsible for effective asset management, proper tracking,
              accountability, and safe management of all institutional assets.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal-submit"
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

CustodianModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default CustodianModal;
