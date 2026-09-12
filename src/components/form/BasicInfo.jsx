// src/components/form/BasicInfo.jsx
import { useEffect, useRef, useState } from "react";
import "./Form.css";
import "./BasicInfo.css";
import useCategoryOptions from "../../hooks/shared/useCategoryOptions";

/* ─── Category dropdown ──────────────────────────────────────────────────
   Native <select> popups are rendered by the browser/OS and can't be
   height-capped or made scrollable via CSS, so once the category list
   grows this becomes its own small scrollable panel instead. Selecting
   an option calls onSelect with the plain category name — the parent
   wires that into the same onChange({ target: { name, value } }) shape
   already used for tracking_mode above. */
function CategoryDropdown({ value, options, loading, error, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(name) {
    onSelect(name);
    setIsOpen(false);
  }

  return (
    <div className="reg-category-dropdown" ref={containerRef}>
      <button
        type="button"
        className={`reg-category-trigger ${error ? "reg-input--error" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={loading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={value ? "" : "reg-category-placeholder"}>
          {loading ? "Loading categories..." : value || "--Select Category--"}
        </span>
        <span className="reg-category-caret" aria-hidden="true" />
      </button>

      {isOpen && !loading && (
        <ul className="reg-category-panel" role="listbox">
          {options.length === 0 ? (
            <li className="reg-category-empty">No categories yet.</li>
          ) : (
            options.map((name) => (
              <li
                key={name}
                role="option"
                aria-selected={value === name}
                className={`reg-category-option ${
                  value === name ? "reg-category-option--active" : ""
                }`}
                onClick={() => handleSelect(name)}
              >
                {name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// Now scoped to ONE line item. acquisition_type, date_acquired and
// donated_by moved up to AcquisitionInfo (filled once per batch).
function BasicInfo({
  item,
  isDonated,
  onChange,
  setSerialAt,
  autoNumberSerials,
  error,
  qty,
  isIndividual,
}) {
  const { categories, loading: categoriesLoading } = useCategoryOptions();

  return (
    <div className="reg-card">
      <p className="reg-card-title">Basic Asset Information</p>

      <div className="reg-grid">
        <div className="reg-field">
          <label className="reg-label">Serial Number</label>
          <input
            className={`reg-input ${error.serial_number ? "reg-input--error" : ""}`}
            name="serial_number"
            placeholder={
              isIndividual
                ? "Base for auto-numbering, e.g. SN-99823-X"
                : "e.g. SN-99823-X"
            }
            value={item.serial_number}
            onChange={onChange}
          />
          {error.serial_number && (
            <p className="reg-error">{error.serial_number}</p>
          )}
          {!isIndividual && (
            <p className="reg-hint">
              Leave blank if this batch has no printed serial.
            </p>
          )}
        </div>

        <div className="reg-field">
          <label className="reg-label">
            Category <span className="reg-required">*</span>
          </label>
          <CategoryDropdown
            value={item.category_id}
            options={categories}
            loading={categoriesLoading}
            error={!!error.category_id}
            onSelect={(name) =>
              onChange({ target: { name: "category_id", value: name } })
            }
          />
          {error.category_id && (
            <p className="reg-error">{error.category_id}</p>
          )}
        </div>

        <div className="reg-field reg-field--full">
          <label className="reg-label">
            Description <span className="reg-required">*</span>
          </label>
          <textarea
            className={`reg-textarea ${error.description ? "reg-input--error" : ""}`}
            name="description"
            placeholder="Full asset description and technical specifications..."
            rows={4}
            value={item.description}
            onChange={onChange}
          />
          {error.description && (
            <p className="reg-error">{error.description}</p>
          )}
        </div>

        {/* Unit value only applies to purchased items — donated items have
            no per-unit cost. isDonated now comes from the batch-level
            Acquisition Info step instead of a per-item toggle. */}
        {!isDonated && (
          <div className="reg-field">
            <label className="reg-label">
              Unit Value <span className="reg-required">*</span>
            </label>
            <div className="reg-input-prefix-wrap">
              <span className="reg-input-prefix">₱</span>
              <input
                className={`reg-input reg-input--prefixed ${error.unit_value ? "reg-input--error" : ""}`}
                type="number"
                name="unit_value"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={item.unit_value}
                onChange={onChange}
              />
            </div>
            {error.unit_value && (
              <p className="reg-error">{error.unit_value}</p>
            )}
          </div>
        )}

        <div className="reg-field">
          <label className="reg-label">
            Quantity <span className="reg-required">*</span>
          </label>
          <input
            className={`reg-input ${error.qty ? "reg-input--error" : ""}`}
            type="number"
            name="qty"
            min="1"
            placeholder="1"
            value={item.qty}
            onChange={onChange}
          />
          {error.qty && <p className="reg-error">{error.qty}</p>}
        </div>

        {qty > 1 && (
          <div className="reg-field reg-field--full">
            <label className="reg-label">
              Tracking Mode <span className="reg-required">*</span>
            </label>
            <div className="reg-tracking-options">
              <div
                className={`reg-tracking-card ${
                  item.tracking_mode === "single_bulk"
                    ? "reg-tracking-card--active"
                    : ""
                }`}
                onClick={() =>
                  onChange({
                    target: { name: "tracking_mode", value: "single_bulk" },
                  })
                }
              >
                <p className="reg-tracking-card-title">Single record</p>
                <p className="reg-tracking-card-desc">
                  One asset ID and QR code for all {qty} units. Best for bulk or
                  consumable items.
                </p>
              </div>
              <div
                className={`reg-tracking-card ${
                  item.tracking_mode === "individual"
                    ? "reg-tracking-card--active"
                    : ""
                }`}
                onClick={() =>
                  onChange({
                    target: { name: "tracking_mode", value: "individual" },
                  })
                }
              >
                <p className="reg-tracking-card-title">Individual records</p>
                <p className="reg-tracking-card-desc">
                  {qty} unique asset IDs and QR codes, one per unit. Best for
                  high-value equipment.
                </p>
              </div>
            </div>
            {error.tracking_mode && (
              <p className="reg-error">{error.tracking_mode}</p>
            )}
          </div>
        )}

        {isIndividual && (
          <div className="reg-field reg-field--full">
            <div className="reg-serial-list-header">
              <label className="reg-label">Unit Serial Numbers</label>
              <button
                type="button"
                className="reg-serial-autonumber"
                onClick={autoNumberSerials}
              >
                Auto-number from base
              </button>
            </div>
            <div className="reg-serial-list">
              {item.serial_numbers.map((serial, i) => (
                <input
                  key={i}
                  className="reg-input"
                  placeholder={`Unit ${i + 1} serial`}
                  value={serial}
                  onChange={(e) => setSerialAt(i, e.target.value)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="reg-field reg-field--full">
          <label className="reg-label">Remarks</label>
          <textarea
            className="reg-textarea"
            name="remarks"
            placeholder="Additional notes, maintenance history..."
            rows={3}
            value={item.remarks}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}

export default BasicInfo;
