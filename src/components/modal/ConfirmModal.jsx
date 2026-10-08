import React, { useEffect, useId } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./ConfirmModal.css";

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  children,
  icon = "fa-solid fa-triangle-exclamation",
  iconTone = "warning",
  confirmLabel = "Proceed",
  confirmIcon = "fa-solid fa-check",
  confirmTone = "success",
  cancelLabel = "Cancel",
  closeLabel = "Return",
  infoOnly = false,
  closeOnOverlayClick = true,
}) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleConfirm() {
    onClose?.();
    onConfirm?.();
  }

  function handleCancel() {
    onClose?.();
    onCancel?.();
  }

  return (
    <div
      className="confirm-modal-overlay"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className="confirm-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-modal-header">
          {icon && (
            <div
              className={`confirm-modal-icon confirm-modal-icon--${iconTone}`}
            >
              <FontAwesomeIcon icon={icon} aria-hidden="true" />
            </div>
          )}
          <h3 id={titleId}>{title}</h3>
        </div>

        <div className="confirm-modal-body">{children}</div>

        <div className="confirm-modal-actions">
          {infoOnly ? (
            <button
              type="button"
              className="confirm-modal-btn confirm-modal-btn--primary"
              onClick={onClose}
            >
              {closeLabel}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="confirm-modal-btn confirm-modal-btn--cancel"
                onClick={handleCancel}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={`confirm-modal-btn confirm-modal-btn--${confirmTone}`}
                onClick={handleConfirm}
              >
                {confirmIcon && (
                  <FontAwesomeIcon icon={confirmIcon} aria-hidden="true" />
                )}
                {confirmLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
