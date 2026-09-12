// src/components/form/AcquisitionInfo.jsx
import "./Form.css";
import "./AcquisitionInfo.css";
import { todayISO } from "../../utils/date";
import ImagePanel from "./ImagePanel";

function AcquisitionInfo({
  acquisitionInfo,
  onChange,
  setField,
  docImage,
  setDocImage,
}) {
  const isDonated = acquisitionInfo.acquisition_type === "donated";

  return (
    <div className="reg-card">
      <p className="reg-card-title">Acquisition Info</p>
      <p className="reg-card-subtitle">
        These details apply to every asset in this batch — filled in once.
      </p>

      <div className="reg-grid">
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
          <label className="reg-label">
            Date Acquired <span className="reg-required">*</span>
          </label>
          <input
            className="reg-input"
            type="date"
            name="date_acquired"
            max={todayISO}
            value={acquisitionInfo.date_acquired}
            onChange={onChange}
          />
        </div>

        {isDonated ? (
          <div className="reg-field">
            <label className="reg-label">
              Donated By <span className="reg-required">*</span>
            </label>
            <input
              className="reg-input"
              name="donated_by"
              placeholder="Donor name or organization"
              value={acquisitionInfo.donated_by}
              onChange={onChange}
            />
          </div>
        ) : (
          <>
            <div className="reg-field">
              <label className="reg-label">
                Supplier <span className="reg-required">*</span>
              </label>
              <input
                className="reg-input"
                name="supplier"
                placeholder="Supplier or vendor name"
                value={acquisitionInfo.supplier}
                onChange={onChange}
              />
            </div>
            <div className="reg-field">
              <label className="reg-label">PO / Invoice Reference</label>
              <input
                className="reg-input"
                name="po_reference"
                placeholder="Optional"
                value={acquisitionInfo.po_reference}
                onChange={onChange}
              />
            </div>
          </>
        )}

        <div className="reg-field reg-field--full">
          <ImagePanel
            title={isDonated ? "Deed of Donation" : "PAR / ICS Document"}
            image={docImage}
            onImageChange={setDocImage}
            required
          />
        </div>
      </div>
    </div>
  );
}

export default AcquisitionInfo;
