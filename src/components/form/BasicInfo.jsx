import "./Form.css";
import "./BasicInfo.css";
import { ASSET_CATEGORIES } from "../../data/assets";
import { todayISO } from "../../utils/date";

function BasicInfo({ form, onChange, categories, loadingOptions, error }) {

  return (
    <div className="reg-card">
      <p className="reg-card-title">Basic Asset Information</p>

      <div className="reg-grid">
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
            <option value="">Select Category</option>
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
          {error.unit_value && <p className="reg-error">{error.unit_value}</p>}
        </div>

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
