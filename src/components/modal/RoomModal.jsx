import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./RoomModal.css";

function RoomModal({
  onClose,
  onSubmit,
  value,
  onChange,
  error,
  isSubmitting,
  existingRooms = [],
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="room-modal-overlay">
      <div
        className="room-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-modal-title"
      >
        {/* Header */}
        <div className="room-modal-header">
          <div className="room-modal-badge" aria-hidden="true">
            <FontAwesomeIcon icon="fa-solid fa-door-open" />
          </div>
          <div className="room-modal-heading">
            <h2 id="room-modal-title">Add new room</h2>
          </div>
          <button
            type="button"
            className="room-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Body */}
        <div className="room-modal-body">
          <div className={`room-modal-field ${error ? "has-error" : ""}`}>
            <label htmlFor="room-name-input">
              Room name
              <span className="room-modal-char-count">
                {value.trim().length}/50
              </span>
            </label>
            <input
              id="room-name-input"
              ref={inputRef}
              type="text"
              name="name"
              placeholder="e.g. Computer Lab 1"
              value={value}
              onChange={onChange}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              maxLength={50}
              disabled={isSubmitting}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "room-name-error" : undefined}
            />
            {error && (
              <span
                id="room-name-error"
                className="room-modal-error"
                role="alert"
              >
                <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" />
                {error}
              </span>
            )}
          </div>

          {/* Info box */}
          <div className="room-modal-info">
            <FontAwesomeIcon
              icon="fa-solid fa-circle-info"
              className="room-modal-info-icon"
            />
            <p className="room-modal-info-text">
              Enter a unique and descriptive room name. Rooms are used for
              accurate asset assignment, inventory tracking, and organized
              management of all institutional resources.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="room-modal-footer">
          <button
            type="button"
            className="room-modal-btn room-modal-btn--cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="room-modal-btn room-modal-btn--submit"
            onClick={onSubmit}
            disabled={isSubmitting || !value.trim()}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
                Adding...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="fa-solid fa-plus" />
                Add room
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomModal;
