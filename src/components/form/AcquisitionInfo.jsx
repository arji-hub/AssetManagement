// src/components/form/AcquisitionInfo.jsx
import "./Form.css";
import "./AcquisitionInfo.css";
import { todayISO } from "../../utils/date";
import ImagePanel from "./ImagePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function AcquisitionInfo({
  acquisitionInfo,
  onChange,
  setField,
  docImage,
  setDocImage,
  scanning,
  scanStatus,
  scanError,
  scanItemCount,
  onScanDoc,
  scanDisabled,
}) {
  const isDonated = acquisitionInfo.acquisition_type === "donated";

  return (
    <div className="reg-card">
      <p className="reg-card-title">Acquisition Info</p>
      <p className="reg-card-subtitle">
        These details apply to every asset in this batch — filled in once.
      </p>

      <div className="reg-grid">
        {/* 1. acquisition type */}
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

        {/* 2. document + scan */}
        <div className="reg-field reg-field--full acq-scan">
          <p className="acq-scan-hint">
            Upload the document and scan it to autofill the fields below.
          </p>

          <ImagePanel
            title={isDonated ? "Deed of Donation" : "PAR / ICS Document"}
            image={docImage}
            onImageChange={setDocImage}
            required
          />

          {docImage && (
            <div className="acq-scan-actions">
              {scanning ? (
                <div
                  className="acq-scan-progress"
                  role="status"
                  aria-live="polite"
                >
                  <p className="acq-scan-progress-text">
                    Scanning document… this may take a few seconds.
                  </p>
                  <div className="acq-progress" aria-hidden="true">
                    <div className="acq-progress-bar" />
                  </div>
                </div>
              ) : scanStatus === "success" ? (
                <p
                  className="acq-scan-result acq-scan-result--success"
                  role="status"
                >
                  <FontAwesomeIcon icon="fa-solid fa-circle-check" />
                  Scan complete
                  {scanItemCount > 0
                    ? ` — ${scanItemCount} item${scanItemCount === 1 ? "" : "s"} found. Review them in the next step.`
                    : " — no items detected. You can add them manually in the next step."}
                </p>
              ) : scanStatus === "error" ? (
                <p
                  className="acq-scan-result acq-scan-result--error"
                  role="alert"
                >
                  <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" />
                  Scan failed{scanError ? `: ${scanError}` : "."} Upload a
                  different image to try again.
                </p>
              ) : (
                <button
                  type="button"
                  className="reg-btn reg-btn--ghost acq-scan-btn"
                  onClick={onScanDoc}
                  disabled={scanDisabled}
                >
                  Scan Doc
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. fields that will be autofilled */}
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
        )}
      </div>
    </div>
  );
}

export default AcquisitionInfo;
