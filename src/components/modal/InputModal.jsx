import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./InputModal.css";

function InputModal({
  title,
  description,
  infotext,
  inputHeader,
  onClose,
  value,
  onChange,
  onSubmit,
  placeholder = "",
  submitLabel = "Save",
  isSubmitting = false,
  error = "",
  readOnly = false,
}) {
  const isFormValid = value?.toString().trim().length > 0;

  return (
    <div className="generic-input-modal-overlay">
      <div
        className="generic-input-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="generic-input-modal-title"
      >
        <div className="generic-input-modal-header">
          <h2 id="generic-input-modal-title">{title}</h2>
          <button
            className="generic-input-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div className="generic-input-modal-body">
          {description && (
            <p className="generic-input-modal-description">{description}</p>
          )}

          <div
            className={`generic-input-modal-field ${error ? "has-error" : ""}`}
          >
            {inputHeader && (
              <label htmlFor="generic-input-modal-input">{inputHeader}</label>
            )}
            <input
              id="generic-input-modal-input"
              type="text"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder={placeholder}
              disabled={isSubmitting}
              readOnly={readOnly}
            />
            {error && (
              <span className="generic-input-modal-error" role="alert">
                {error}
              </span>
            )}
          </div>

          {infotext && (
            <div className="modal-info">
              <FontAwesomeIcon
                icon="fa-solid fa-circle-info"
                className="info-icon"
              />
              <p className="info-text">{infotext}</p>
            </div>
          )}
        </div>

        <div className="generic-input-modal-footer">
          <button
            className="generic-input-modal-btn generic-input-modal-btn--cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="generic-input-modal-btn generic-input-modal-btn--submit"
            onClick={onSubmit}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputModal;
