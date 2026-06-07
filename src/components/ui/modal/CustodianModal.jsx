import { useState } from "react";
import PropTypes from "prop-types";
import "./CustodianModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const INITIAL_FORM = {
  email: "",
  username: "",
  firstName: "",
  middleName: "",
  lastName: "",
  classification: "fulltime",
  password: "",
  confirmPassword: "",
};

const INITIAL_ERRORS = {
  email: "",
  password: "",
  confirmPassword: "",
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function CustodianModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);

  const isComplete =
    form.email.trim() &&
    form.username.trim() &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.password.trim() &&
    form.confirmPassword.trim() &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  const validate = (name, value) => {
    switch (name) {
      case "email":
        return value && !isValidEmail(value)
          ? "Please enter a valid email address."
          : "";
      case "password":
        return value && value.length < 6
          ? "Password must be at least 6 characters."
          : "";
      case "confirmPassword":
        return value && value !== form.password
          ? "Passwords do not match."
          : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // re-validate confirmPassword when password changes
    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validate("password", value),
        confirmPassword:
          form.confirmPassword && value !== form.confirmPassword
            ? "Passwords do not match."
            : "",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    const { confirmPassword, ...submitData } = form;
    onSubmit(submitData);
    onClose();
  };

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
          {/* Row 1: Email */}
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
          </div>

          {/* Row 2: Username */}
          <div className="modal-row">
            <div className="modal-field">
              <label htmlFor="username">USERNAME</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3: First Name + Middle Name */}
          <div className="modal-row">
            <div className="modal-field">
              <label htmlFor="firstName">FIRST NAME</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter first name"
                value={form.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="modal-field">
              <label htmlFor="middleName">MIDDLE NAME</label>
              <input
                id="middleName"
                name="middleName"
                type="text"
                placeholder="Enter text"
                value={form.middleName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 4: Last Name + Classification */}
          <div className="modal-row">
            <div className="modal-field">
              <label htmlFor="lastName">LAST NAME</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter last name"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>
            <div className="modal-field">
              <label htmlFor="classification">CLASSIFICATION</label>
              <select
                id="classification"
                name="classification"
                value={form.classification}
                onChange={handleChange}
              >
                <option value="fulltime">FULL-TIME</option>
                <option value="parttime">PART-TIME</option>
              </select>
            </div>
          </div>

          {/* Row 5: Password + Confirm Password */}
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
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""}
              />
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
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
            className={`modal-submit ${!isComplete ? "modal-submit--disabled" : ""}`}
            onClick={handleSubmit}
            disabled={!isComplete}
          >
            Add Record
          </button>
        </div>
      </div>
    </div>
  );
}

CustodianModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CustodianModal;
