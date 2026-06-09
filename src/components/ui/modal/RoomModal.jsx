import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./RoomModal.css";

function RoomModal({ onClose, onSubmit, existingRooms = [] }) {
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus the input when modal opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const validate = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Room name is required.";
    if (trimmed.length < 2) return "Room name must be at least 2 characters.";
    if (trimmed.length > 50) return "Room name must be 50 characters or fewer.";
    const isDuplicate = existingRooms.some(
      (name) => name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (isDuplicate) return `"${trimmed}" already exists.`;
    return "";
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setRoomName(value);
    if (error) setError(validate(value));
  };

  const handleSubmit = async () => {
    const trimmed = roomName.trim();
    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ name: trimmed });
      onClose();
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              placeholder="e.g. Computer Lab 1"
              value={roomName}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              maxLength={50}
              disabled={isSubmitting}
            />
            {error && (
              <span className="room-modal-error" role="alert">
                {error}
              </span>
            )}
            <span className="room-modal-char-count">
              {roomName.trim().length}/50
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
            onClick={handleSubmit}
            disabled={isSubmitting || !roomName.trim()}
          >
            {isSubmitting ? "Adding..." : "Add Room"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomModal;
