import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./DateRangeModal.css";

function toLocalDate(value) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatShort(value) {
  const date = toLocalDate(value);
  if (!date) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const PRESETS = [
  {
    label: "Today",
    getRange: () => {
      const today = new Date();
      return { start: toInputValue(today), end: toInputValue(today) };
    },
  },
  {
    label: "Last 7 days",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return { start: toInputValue(start), end: toInputValue(end) };
    },
  },
  {
    label: "Last 30 days",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return { start: toInputValue(start), end: toInputValue(end) };
    },
  },
  {
    label: "This month",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: toInputValue(start), end: toInputValue(end) };
    },
  },
];

function DateRangeModal({ startDate, endDate, onApply, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);

  const openModal = () => {
    setDraftStart(startDate);
    setDraftEnd(endDate);
    setIsOpen(true);
  };

  const closeModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closeModal]);

  const handlePreset = (preset) => {
    const { start, end } = preset.getRange();
    setDraftStart(start);
    setDraftEnd(end);
  };

  const handleApply = () => {
    onApply(draftStart, draftEnd);
    setIsOpen(false);
  };

  const handleClear = () => {
    setDraftStart("");
    setDraftEnd("");
    onClear?.();
    onApply("", "");
    setIsOpen(false);
  };

  const rangeInvalid =
    draftStart && draftEnd && new Date(draftStart) > new Date(draftEnd);

  const hasActiveRange = Boolean(startDate || endDate);
  const triggerLabel = hasActiveRange
    ? `${formatShort(startDate) || "Any"} – ${formatShort(endDate) || "Any"}`
    : "Date range";

  return (
    <>
      <button
        type="button"
        className={`date-range-trigger${hasActiveRange ? " date-range-trigger--active" : ""}`}
        onClick={openModal}
      >
        <FontAwesomeIcon icon="fa-solid fa-calendar-days" />
        <span>{triggerLabel}</span>
        {hasActiveRange && (
          <span
            className="date-range-trigger-clear"
            role="button"
            tabIndex={0}
            aria-label="Clear date range"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="date-range-modal-overlay" onClick={closeModal}>
          <div
            className="date-range-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Select date range"
          >
            <div className="date-range-modal-header">
              <h3 className="date-range-modal-title">Filter by date</h3>
              <button
                type="button"
                className="date-range-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <FontAwesomeIcon icon="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="date-range-modal-body">
              <div className="date-range-presets">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className="date-range-preset-btn"
                    onClick={() => handlePreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="date-range-inputs">
                <div className="date-range-field">
                  <label htmlFor="date-range-start">Start date</label>
                  <input
                    id="date-range-start"
                    type="date"
                    value={draftStart}
                    max={draftEnd || undefined}
                    onChange={(e) => setDraftStart(e.target.value)}
                  />
                </div>
                <div className="date-range-field">
                  <label htmlFor="date-range-end">End date</label>
                  <input
                    id="date-range-end"
                    type="date"
                    value={draftEnd}
                    min={draftStart || undefined}
                    onChange={(e) => setDraftEnd(e.target.value)}
                  />
                </div>
              </div>

              {rangeInvalid && (
                <p className="date-range-error">
                  Start date must be before end date.
                </p>
              )}
            </div>

            <div className="date-range-modal-footer">
              <button
                type="button"
                className="date-range-btn date-range-btn--ghost"
                onClick={handleClear}
              >
                Clear
              </button>
              <div className="date-range-modal-footer-right">
                <button
                  type="button"
                  className="date-range-btn date-range-btn--ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="date-range-btn date-range-btn--primary"
                  onClick={handleApply}
                  disabled={rangeInvalid}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DateRangeModal;
