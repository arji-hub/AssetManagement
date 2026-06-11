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
          <h2 id="room-modal-title">Add Room</h2>
          <button
            className="room-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="room-modal-body">
          <div className={`room-modal-field ${error ? "has-error" : ""}`}>
            <label htmlFor="room-name-input">Room Name</label>
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
            />
            {error && (
              <span className="room-modal-error" role="alert">
                {error}
              </span>
            )}
            <span className="room-modal-char-count">
              {value.trim().length}/50
            </span>
          </div>

          {/* Info box */}
          <div className="modal-info">
            <FontAwesomeIcon
              icon="fa-solid fa-circle-info"
              className="info-icon"
            />
            <p className="info-text">
              Enter a unique and descriptive room name to register a new
              location for accurate asset assignment, inventory tracking, and
              organized management of all institutional resources.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="room-modal-footer">
          <button
            className="room-modal-btn room-modal-btn--cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="room-modal-btn room-modal-btn--submit"
            onClick={onSubmit}
            disabled={isSubmitting || !value.trim()}
          >
            {isSubmitting ? "Adding..." : "Add Room"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomModal;