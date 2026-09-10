import "./Form.css";
import "./BasicInfo.css";
import { ASSET_CATEGORIES } from "../../data/assets";
import { todayISO } from "../../utils/date";

function BasicInfo({ form, onChange, categories, loadingOptions, error }) {
  const isDonated = form.acquisition_type === "donated";
  const qty = parseInt(form.qty, 10) || 1;
  const showTrackingMode = qty > 1;

  const donatedByMissing = isDonated && !form.donated_by.trim();
  const trackingModeMissing = showTrackingMode && !form.tracking_mode;

  const setField = (name, value) => onChange({ target: { name, value } });

  return (
    <div className="reg-card">
      <p className="reg-card-title">Basic Asset Information</p>

      <div className="reg-grid">
        {/* ── Acquisition type ── */}
        <div className="reg-field reg-field--full">
          <label className="reg-label">
            Acquisition Type <span className="reg-required">*</span>
          </label>
          <div className="reg-toggle-group">
            <button
              type="button"
              className={`reg-toggle-option ${
                !isDonated ? "reg-toggle-option--active" : ""
              }`}
              onClick={() => setField("acquisition_type", "purchased")}
            >
              Purchased
            </button>
            <button
              type="button"
              className={`reg-toggle-option ${
                isDonated ? "reg-toggle-option--active" : ""
              }`}
              onClick={() => setField("acquisition_type", "donated")}
            >
              Donated
            </button>
          </div>
        </div>

        <div className="reg-field">
          <label className="reg-label">Serial Number</label>
          <input
            className={`reg-input ${error.serial_number ? "reg-input--error" : ""}`}
            name="serial_number"
            placeholder="e.g. SN-99823-X"
            value={form.serial_number}
            onChange={onChange}
          />
          {error.serial_number && (
            <p className="reg-error">{error.serial_number}</p>
          )}
        </div>

        <div className="reg-field">
          <label className="reg-label">
            Category <span className="reg-required">*</span>
          </label>
          <select
            className={`reg-select ${error.category_id ? "reg-input--error" : ""}`}
            name="category_id"
            value={form.category_id}
            onChange={onChange}
          >
            <option value="">--Select Category--</option>
            {ASSET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
            value={form.description}
            onChange={onChange}
          />
          {error.description && (
            <p className="reg-error">{error.description}</p>
          )}
        </div>

        <div className="reg-field">
          <label className="reg-label">
            Date Acquired <span className="reg-required">*</span>
          </label>
          <input
            className={`reg-input ${error.date_acquired ? "reg-input--error" : ""}`}
            type="date"
            name="date_acquired"
            max={todayISO}
            value={form.date_acquired}
            onChange={onChange}
          />
          {error.date_acquired && (
            <p className="reg-error">{error.date_acquired}</p>
          )}
        </div>

        {/* ── Conditional: cost (purchased) vs donor (donated) ── */}
        {isDonated ? (
          <div className="reg-field">
            <label className="reg-label">
              Donated By <span className="reg-required">*</span>
            </label>
            <input
              className={`reg-input ${
                error.donated_by || donatedByMissing ? "reg-input--error" : ""
              }`}
              name="donated_by"
              placeholder="Donor name or organization"
              value={form.donated_by}
              onChange={onChange}
            />
            {error.donated_by ? (
              <p className="reg-error">{error.donated_by}</p>
            ) : (
              donatedByMissing && (
                <p className="reg-error">Donor name is required.</p>
              )
            )}
          </div>
        ) : (
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
                value={form.unit_value}
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
            value={form.qty}
            onChange={onChange}
          />
          {error.qty && <p className="reg-error">{error.qty}</p>}
        </div>

        {/* ── Conditional: tracking mode, only shown when qty > 1 ── */}
        {showTrackingMode && (
          <div className="reg-field reg-field--full">
            <label className="reg-label">
              Tracking Mode <span className="reg-required">*</span>
            </label>
            <div className="reg-tracking-options">
              <div
                className={`reg-tracking-card ${
                  form.tracking_mode === "single_bulk"
                    ? "reg-tracking-card--active"
                    : ""
                }`}
                onClick={() => setField("tracking_mode", "single_bulk")}
              >
                <p className="reg-tracking-card-title">Single record</p>
                <p className="reg-tracking-card-desc">
                  One asset ID and QR code for all {qty} units. Best for bulk or
                  consumable items.
                </p>
              </div>
              <div
                className={`reg-tracking-card ${
                  form.tracking_mode === "individual"
                    ? "reg-tracking-card--active"
                    : ""
                }`}
                onClick={() => setField("tracking_mode", "individual")}
              >
                <p className="reg-tracking-card-title">Individual records</p>
                <p className="reg-tracking-card-desc">
                  {qty} unique asset IDs and QR codes, one per unit. Best for
                  high-value equipment.
                </p>
              </div>
            </div>
            {trackingModeMissing && (
              <p className="reg-error">
                Choose a tracking mode before continuing.
              </p>
            )}
          </div>
        )}

        <div className="reg-field reg-field--full">
          <label className="reg-label">Remarks</label>
          <textarea
            className="reg-textarea"
            name="remarks"
            placeholder="Additional notes, maintenance history..."
            rows={3}
            value={form.remarks}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}

export default BasicInfo;
