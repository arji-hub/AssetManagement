import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck,
  faTriangleExclamation,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./AuditConfirmRoomModal.css";

function AuditConfirmRoomModal({ onConfirm, roomName, isEmpty = false }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleConfirm() {
    setIsOpen(false);
    onConfirm?.();
  }

  return (
    <>
      <button
        type="button"
        className="audit-overview-scan-btn"
        onClick={() => setIsOpen(true)}
      >
        <FontAwesomeIcon icon={faClipboardCheck} aria-hidden="true" />
        Create new audit
      </button>

      {isOpen && (
        <div
          className="new-audit-confirm-overlay"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="new-audit-confirm-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="new-audit-header">
              <div className="new-audit-confirm-icon">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  aria-hidden="true"
                />
              </div>

              <h3>{isEmpty ? "No assets to audit" : "Start a new audit?"}</h3>
            </div>

            {isEmpty ? (
              <p>
                This room{roomName ? ` (${roomName})` : ""} has no assets yet.
                Add assets to this room before starting an audit.
              </p>
            ) : (
              <p>
                This will begin a new audit session
                {roomName ? ` for ${roomName}` : ""}. Make sure any audit
                currently in progress for this room has been completed first.
              </p>
            )}

            <div className="new-audit-confirm-actions">
              {isEmpty ? (
                <button
                  type="button"
                  className="new-audit-confirm-return"
                  onClick={() => setIsOpen(false)}
                >
                  Return
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="new-audit-confirm-cancel"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="new-audit-confirm-proceed"
                    onClick={handleConfirm}
                  >
                    <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
                    Proceed
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AuditConfirmRoomModal;
