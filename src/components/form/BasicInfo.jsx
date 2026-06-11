import "./Form.css";
import "./BasicInfo.css";
import { ASSET_CATEGORIES } from "../../data/assets";

function BasicInfo({ form, onChange }) {
  return (
    <div className="reg-card">
      <p className="reg-card-title">Basic Asset Information</p>

      <div className="reg-grid">
        {/* Row 1: Serial Number | Category */}
        <div className="reg-field">
          <label className="reg-label">Serial Number</label>
          <input
            className="reg-input"
            name="serial_number"
            placeholder="e.g. SN-99823-X"
            value={form.serial_number}
            onChange={onChange}
          />
        </div>

        <div className="reg-field">
          <label className="reg-label">
            Category <span className="reg-required">*</span>
          </label>
          <select
            className="reg-select"
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
        </div>

        {/* Row 2: Description — spans full width, required */}
        <div className="reg-field reg-field--full">
          <label className="reg-label">
            Description <span className="reg-required">*</span>
          </label>
          <textarea
            className="reg-textarea"
            name="description"
            placeholder="Full asset description and technical specifications..."
            rows={4}
            value={form.description}
            onChange={onChange}
            required
          />
        </div>

        {/* Row 3: Date Acquired | Unit Value | Quantity */}
        <div className="reg-field">
          <label className="reg-label">
            Date Acquired <span className="reg-required">*</span>
          </label>
          <input
            className="reg-input"
            type="date"
            name="date_acquired"
            value={form.date_acquired}
            onChange={onChange}
          />
        </div>

        <div className="reg-field">
          <label className="reg-label">
            Unit Value <span className="reg-required">*</span>
          </label>
          <div className="reg-input-prefix-wrap">
            <span className="reg-input-prefix">₱</span>
            <input
              className="reg-input reg-input--prefixed"
              type="number"
              name="unit_value"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.unit_value}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="reg-field">
          <label className="reg-label">
            Quantity <span className="reg-required">*</span>
          </label>
          <input
            className="reg-input"
            type="number"
            name="qty"
            min="1"
            placeholder="1"
            value={form.qty}
            onChange={onChange}
          />
        </div>

        {/* Row 4: Remarks — spans full width */}
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