import { useState } from "react";
import PropTypes from "prop-types";
import "./CustodianModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useCustodianRegistration from "../../hooks/custodian/useCustodianRegistration";

/* Reusable field: label + icon-prefixed input + status/error line */
function Field({
  id,
  label,
  icon,
  error,
  checking = false,
  optional = false,
  trailing = null,
  ...inputProps
}) {
  const messageId = `${id}-message`;

  return (
    <div className="modal-field">
      <label htmlFor={id}>
        {label}
        {optional && <span className="field-optional">Optional</span>}
      </label>

      <div
        className={`input-wrap${error ? " has-error" : ""}${icon ? "" : " no-icon"}`}
      >
        {icon && <FontAwesomeIcon icon={icon} className="input-icon" />}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error || checking ? messageId : undefined}
          {...inputProps}
        />
        {trailing}
      </div>

      {checking && (
        <span id={messageId} className="field-checking">
          <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
          Checking availability...
        </span>
      )}
      {error && (
        <span id={messageId} className="field-error" role="alert">
          <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" />
          {error}
        </span>
      )}
    </div>
  );
}

Field.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.string,
  error: PropTypes.string,
  checking: PropTypes.bool,
  optional: PropTypes.bool,
  trailing: PropTypes.node,
};

function CustodianModal({ onClose, onSubmit, isSubmitting = false }) {
  const { form, errors, checking, isComplete, handleChange, handleSubmit } =
    useCustodianRegistration({ onSubmit });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Live monogram from the name being typed
  const initials = `${form.first_name?.trim()?.[0] ?? ""}${
    form.last_name?.trim()?.[0] ?? ""
  }`.toUpperCase();

  const visibilityToggle = (visible, toggle, label) => (
    <button
      type="button"
      className="input-toggle"
      onClick={toggle}
      aria-label={visible ? `Hide ${label}` : `Show ${label}`}
    >
      <FontAwesomeIcon
        icon={visible ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}
      />
    </button>
  );

  return (
    <div className="modal-overlay">
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custodian-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="modal-header">
          <div className="modal-monogram" aria-hidden="true">
            {initials || <FontAwesomeIcon icon="fa-solid fa-user-plus" />}
          </div>
          <div className="modal-heading">
            <h2 id="custodian-modal-title" className="modal-title">
              Add new custodian
            </h2>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
          {/* Row 1: Email | Username */}
          <div className="modal-row">
            <Field
              id="email"
              name="email"
              type="email"
              label="Email"
              icon="fa-solid fa-envelope"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              checking={checking.email}
              autoComplete="off"
            />
            <Field
              id="username"
              name="user_name"
              type="text"
              label="Username"
              icon="fa-solid fa-user"
              placeholder="Choose a username"
              value={form.user_name}
              onChange={handleChange}
              error={errors.user_name}
              checking={checking.user_name}
              autoComplete="off"
            />
          </div>

          <div className="modal-row">
            <Field
              id="firstName"
              name="first_name"
              type="text"
              label="First name"
              placeholder="Juan"
              value={form.first_name}
              onChange={handleChange}
            />
            <Field
              id="middleName"
              name="middle_name"
              type="text"
              label="Middle name"
              placeholder="Santos"
              value={form.middle_name}
              onChange={handleChange}
              optional
            />
          </div>
          <div className="modal-row">
            <Field
              id="lastName"
              name="last_name"
              type="text"
              label="Last name"
              placeholder="Dela Cruz"
              value={form.last_name}
              onChange={handleChange}
            />

            <fieldset className="modal-field segmented-field">
              <legend>Classification</legend>
              <div className="segmented">
                <input
                  type="radio"
                  id="role-fulltime"
                  name="role"
                  value="fulltime"
                  checked={form.role === "fulltime"}
                  onChange={handleChange}
                />
                <label htmlFor="role-fulltime">
                  <FontAwesomeIcon icon="fa-solid fa-briefcase" />
                  Full-time
                </label>

                <input
                  type="radio"
                  id="role-parttime"
                  name="role"
                  value="parttime"
                  checked={form.role === "parttime"}
                  onChange={handleChange}
                />
                <label htmlFor="role-parttime">
                  <FontAwesomeIcon icon="fa-solid fa-clock" />
                  Part-time
                </label>
              </div>
            </fieldset>
          </div>

          {/* Row 4: Password | Confirm password */}
          <div className="modal-row">
            <Field
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              icon="fa-solid fa-lock"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
              trailing={visibilityToggle(
                showPassword,
                () => setShowPassword((v) => !v),
                "password",
              )}
            />
            <Field
              id="confirmPassword"
              name="confirm_password"
              type={showConfirm ? "text" : "password"}
              label="Confirm password"
              icon="fa-solid fa-lock"
              placeholder="Re-enter password"
              value={form.confirm_password}
              onChange={handleChange}
              error={errors.confirm_password}
              autoComplete="new-password"
              trailing={visibilityToggle(
                showConfirm,
                () => setShowConfirm((v) => !v),
                "confirmation password",
              )}
            />
          </div>

          {/* ── Info box ── */}
          <div className="modal-info">
            <FontAwesomeIcon
              icon="fa-solid fa-circle-info"
              className="info-icon"
            />
            <p className="info-text">
              Enter complete and accurate details. Custodians are responsible
              for tracking, accountability, and the safe management of all
              institutional assets.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          <button type="button" className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="modal-submit"
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
                Adding...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="fa-solid fa-user-plus" />
                Add custodian
              </>
            )}
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
