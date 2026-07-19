import PropTypes from "prop-types";
import "./ScanStatusModal.css";
import { formatDate } from "../../../utils/date";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ScanStatusModal({ item, status, errorMessage, onClose }) {
  if (!item) return null;

  return (
    <div className="scan-modal-overlay">
      <div className="scan-modal-container">
        {/* ── Loading (Verifying Scan) ── */}
        {status === "loading" && (
          <>
            <div className="scan-modal-spinner" />
            <h2 className="scan-modal-title">Verifying Asset</h2>

            <div className="scan-modal-item-info">
              <div className="scan-modal-item-row">
                <span className="scan-modal-item-label">Asset ID:</span>
                <span className="scan-modal-item-value font-bold">
                  {item.asset_id || item.id}
                </span>
              </div>
              {item.description && (
                <div className="scan-modal-item-row">
                  <span className="scan-modal-item-label">Description:</span>
                  <span className="scan-modal-item-value">
                    {item.description}
                  </span>
                </div>
              )}
              {item.category && (
                <div className="scan-modal-item-row">
                  <span className="scan-modal-item-label">Category:</span>
                  <span className="scan-modal-item-value">{item.category}</span>
                </div>
              )}
            </div>

            <p className="scan-modal-message">Processing scan...</p>
          </>
        )}

        {/* ── Success (Verified) ── */}
        {status === "success" && (
          <>
            <div className="scan-modal-icon scan-modal-icon--success">
              <FontAwesomeIcon icon="fa-solid fa-circle-check" />
            </div>
            <h2 className="scan-modal-title">Asset Verified</h2>

            <div className="scan-modal-item-info">
              <div className="scan-modal-item-row">
                <span className="scan-modal-item-label">Asset ID:</span>
                <span className="scan-modal-item-value font-bold scan-item-id-success">
                  {item.asset_id || item.id}
                </span>
              </div>
              {item.description && (
                <div className="scan-modal-item-row">
                  <span className="scan-modal-item-label">Description:</span>
                  <span className="scan-modal-item-value">
                    {item.description}
                  </span>
                </div>
              )}
              {item.category && (
                <div className="scan-modal-item-row">
                  <span className="scan-modal-item-label">Category:</span>
                  <span className="scan-modal-item-value">{item.category}</span>
                </div>
              )}
              {item.custodian && (
                <div className="scan-modal-item-row">
                  <span className="scan-modal-item-label">Custodian:</span>
                  <span className="scan-modal-item-value">
                    {item.custodian}
                  </span>
                </div>
              )}
            </div>

            <p className="scan-modal-message scan-modal-message--success">
              ✓ Successfully audited and recorded
            </p>

            {onClose && (
              <button
                className="scan-modal-btn scan-modal-btn--success"
                onClick={onClose}
              >
                Continue Scanning
              </button>
            )}
          </>
        )}

        {/* ── Duplicate (Already Scanned/Audited) ── */}
        {status === "duplicate" && (
          <>
            <div className="scan-modal-icon scan-modal-icon--duplicate">
              <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
            </div>
            <h2 className="scan-modal-title">Already Audited</h2>

            <div className="scan-modal-item-info">
              <div className="scan-modal-item-row">
                <span className="scan-modal-item-label">Asset ID:</span>
                <span className="scan-modal-item-value font-bold">
                  {item.asset_id || item.id}
                </span>
              </div>
              {item.description && (
                <div className="scan-modal-item-row">
                  <span className="scan-modal-item-label">Description:</span>
                  <span className="scan-modal-item-value">
                    {item.description}
                  </span>
                </div>
              )}
              {item.audited_at && (
                <div className="scan-modal-item-row">
                  <span className="scan-modal-item-label">Audited at:</span>
                  <span className="scan-modal-item-value">
                    {formatDate(item.audited_at)}
                  </span>
                </div>
              )}
            </div>

            <p className="scan-modal-message scan-modal-message--duplicate">
              This asset has already been audited in this session
            </p>

            {onClose && (
              <button
                className="scan-modal-btn scan-modal-btn--duplicate"
                onClick={onClose}
              >
                Continue Scanning
              </button>
            )}
          </>
        )}

        {/* ── Error (Failed) ── */}
        {status === "error" && (
          <>
            <div className="scan-modal-icon scan-modal-icon--error">
              <FontAwesomeIcon icon="fa-solid fa-circle-xmark" />
            </div>
            <h2 className="scan-modal-title">Verification Failed</h2>

            <div className="scan-modal-item-info">
              <div className="scan-modal-item-row">
                <span className="scan-modal-item-label">Asset ID:</span>
                <span className="scan-modal-item-value font-bold">
                  {item.asset_id || item.id}
                </span>
              </div>
              {item.description && (
                <div className="scan-modal-item-row">
                  <span className="scan-modal-item-label">Description:</span>
                  <span className="scan-modal-item-value">
                    {item.description}
                  </span>
                </div>
              )}
            </div>

            <p className="scan-modal-message scan-modal-message--error">
              {errorMessage || "Failed to verify asset. Please try again."}
            </p>

            {onClose && (
              <button
                className="scan-modal-btn scan-modal-btn--error"
                onClick={onClose}
              >
                Retry
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

ScanStatusModal.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    asset_id: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    custodian: PropTypes.string,
    audited_at: PropTypes.string,
  }),
  status: PropTypes.oneOf(["loading", "success", "duplicate", "error"])
    .isRequired,
  errorMessage: PropTypes.string,
  onClose: PropTypes.func,
};

export default ScanStatusModal;
