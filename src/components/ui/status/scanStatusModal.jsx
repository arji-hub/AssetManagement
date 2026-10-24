import PropTypes from "prop-types";
import "./scanStatusModal.css";
import { formatDate } from "../../../utils/date";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/* ──────────────────────────────────────────────
   Per-status presentation (tone, icon, title, message)
   ────────────────────────────────────────────── */
function getStatusMeta(status, item, errorMessage) {
  const isNotFound = errorMessage === "not_found.";
  const isMisplaced = item.audit_status === "misplaced";
  const isDamaged = item.audit_status === "damaged";
  // Open damage report filed elsewhere (or earlier): remind, don't offer a new one
  const openNotice =
    item.has_open_report && !isDamaged
      ? {
          icon: "fa-solid fa-screwdriver-wrench",
          text: item.report_no
            ? `This asset already has an open damage report (${item.report_no}). No new report is needed.`
            : "This asset already has an open damage report. No new report is needed.",
        }
      : null;

  switch (status) {
    case "loading":
      return {
        tone: "loading",
        icon: "fa-solid fa-spinner",
        spin: true,
        title: "Verifying asset",
        message: "Processing scan…",
      };
    case "success":
      return {
        tone: "success",
        icon: "fa-solid fa-circle-check",
        title: "Asset verified",
        message: "Successfully audited and recorded",
        messageIcon: "fa-solid fa-clipboard-check",
        notice: openNotice,
      };
    case "duplicate":
      return {
        tone: "warning",
        icon: "fa-solid fa-triangle-exclamation",
        title: isMisplaced
          ? "Already flagged"
          : isDamaged
            ? "Already reported"
            : "Already audited",
        message: isMisplaced
          ? "This asset has already been flagged as a discrepancy in this session."
          : isDamaged
            ? "This asset was audited and has already been reported as damaged."
            : "This asset has already been audited in this session.",
        messageIcon: "fa-solid fa-circle-info",
        notice: isMisplaced ? null : openNotice,
      };
    case "condemned":
      return {
        tone: "error",
        icon: "fa-solid fa-ban",
        title: "Asset condemned",
        message:
          "This asset is condemned. It cannot be audited or flagged as a discrepancy.",
        messageIcon: "fa-solid fa-circle-info",
      };
    case "error":
      return {
        tone: "error",
        icon: "fa-solid fa-circle-xmark",
        title: isNotFound ? "Asset not in audit" : "Verification failed",
        message: isNotFound
          ? "This asset was not found in this audit session."
          : errorMessage || "Failed to verify asset. Please try again.",
        messageIcon: "fa-solid fa-circle-info",
      };
    case "discrepancy_added":
      return {
        tone: "warning",
        icon: "fa-solid fa-flag",
        title: "Discrepancy recorded",
        message: "This asset was logged as a misplaced item in this room.",
        messageIcon: "fa-solid fa-circle-info",
      };
    default:
      return null;
  }
}

/* ──────────────────────────────────────────────
   Secondary details shown for each status
   ────────────────────────────────────────────── */
function getMetaFields(status, item) {
  const category = {
    label: "Category",
    icon: "fa-solid fa-tag",
    value: item.category,
  };
  const custodian = {
    label: "Custodian",
    icon: "fa-solid fa-user",
    value: item.custodian,
  };
  const registeredRoom = {
    label: "Registered room",
    icon: "fa-solid fa-door-closed",
    value: item.registered_room,
  };
  const foundRoom = {
    label: "Found in",
    icon: "fa-solid fa-location-dot",
    value: item.found_room,
  };

  const damageReport = {
    label: "Damage report",
    icon: "fa-solid fa-screwdriver-wrench",
    value: item.report_no ?? (item.has_open_report ? "Open" : null),
  };

  const byStatus = {
    loading: [category],
    success: [category, custodian, damageReport],
    duplicate: [
      {
        label: item.audit_status === "misplaced" ? "Flagged at" : "Audited at",
        icon: "fa-solid fa-clock",
        value: item.audited_at ? formatDate(item.audited_at) : null,
      },
      damageReport,
    ],
    condemned: [
      {
        label: "Serial no.",
        icon: "fa-solid fa-hashtag",
        value: item.serial_number,
      },
    ],
    error: [registeredRoom, foundRoom],
    discrepancy_added: [registeredRoom, foundRoom, custodian],
  };

  return (byStatus[status] || []).filter((field) => field.value);
}

/* ──────────────────────────────────────────────
   Item info card: ID (primary) → description → details
   ────────────────────────────────────────────── */
function ItemInfo({ item, fields }) {
  return (
    <div className="scan-item">
      <div className="scan-item-head">
        <span className="scan-item-badge" aria-hidden="true">
          <FontAwesomeIcon icon="fa-solid fa-barcode" />
        </span>
        <span className="scan-item-id" title="Asset ID">
          {item.asset_id || item.id}
        </span>
      </div>

      {item.description && (
        <p className="scan-item-description">{item.description}</p>
      )}

      {fields.length > 0 && (
        <dl className="scan-item-meta">
          {fields.map((field) => (
            <div className="scan-item-field" key={field.label}>
              <dt className="scan-item-field-label">
                <FontAwesomeIcon icon={field.icon} fixedWidth />
                {field.label}
              </dt>
              <dd className="scan-item-field-value">{field.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

ItemInfo.propTypes = {
  item: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      icon: PropTypes.string,
      value: PropTypes.node,
    }),
  ).isRequired,
};

/* ──────────────────────────────────────────────
   Modal
   ────────────────────────────────────────────── */
function ScanStatusModal({
  item,
  status,
  errorMessage,
  onAddDiscrepancy,
  addingDiscrepancy,
  onReport,
  onClose,
}) {
  if (!item) return null;

  const meta = getStatusMeta(status, item, errorMessage);
  if (!meta) return null;

  const isNotFound = errorMessage === "not_found.";
  const fields = getMetaFields(status, item);

  /* One pattern for every status:
     secondary action (outlined, left) + primary action (filled, right). */
  const actions = (() => {
    switch (status) {
      case "success":
      case "duplicate":
        return {
          secondary: onReport && {
            label: "Report as damaged",
            icon: "fa-solid fa-triangle-exclamation",
            variant: "danger",
            onClick: onReport,
          },
          primary: onClose && {
            label: "Continue scanning",
            icon: "fa-solid fa-qrcode",
            onClick: onClose,
          },
        };

      case "condemned":
      case "discrepancy_added":
        return {
          primary: onClose && {
            label: "Continue scanning",
            icon: "fa-solid fa-qrcode",
            onClick: onClose,
          },
        };

      case "error":
        return {
          secondary: isNotFound &&
            onAddDiscrepancy && {
              label: addingDiscrepancy ? "Recording…" : "Flag as misplaced",
              icon: addingDiscrepancy
                ? "fa-solid fa-spinner"
                : "fa-solid fa-flag",
              spin: addingDiscrepancy,
              variant: "warning",
              onClick: onAddDiscrepancy,
              disabled: addingDiscrepancy,
            },
          primary: onClose && {
            label: isNotFound ? "Dismiss" : "Retry",
            icon: isNotFound ? "fa-solid fa-xmark" : "fa-solid fa-rotate-right",
            onClick: onClose,
          },
        };

      default:
        return {};
    }
  })();

  const renderActions = () => {
    const { secondary, primary } = actions;
    if (!secondary && !primary) return null;

    return (
      <div className="scan-modal-btn-group">
        {secondary && (
          <button
            type="button"
            className={`scan-modal-btn scan-modal-btn--secondary scan-modal-btn--${secondary.variant}`}
            onClick={secondary.onClick}
            disabled={secondary.disabled}
          >
            <FontAwesomeIcon icon={secondary.icon} spin={secondary.spin} />
            {secondary.label}
          </button>
        )}
        {primary && (
          <button
            type="button"
            className="scan-modal-btn scan-modal-btn--primary"
            onClick={primary.onClick}
          >
            <FontAwesomeIcon icon={primary.icon} />
            {primary.label}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="scan-modal-overlay">
      <div
        className="scan-modal-container"
        data-tone={meta.tone}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-modal-title"
        aria-live="polite"
      >
        <div className="scan-modal-icon" aria-hidden="true">
          <FontAwesomeIcon icon={meta.icon} spin={meta.spin} />
        </div>

        <h2 className="scan-modal-title" id="scan-modal-title">
          {meta.title}
        </h2>

        <ItemInfo item={item} fields={fields} />

        {status === "loading" ? (
          <p className="scan-modal-message scan-modal-message--plain">
            {meta.message}
          </p>
        ) : (
          <p className="scan-modal-message">
            <FontAwesomeIcon icon={meta.messageIcon} fixedWidth />
            <span>{meta.message}</span>
          </p>
        )}

        {meta.notice && (
          <p className="scan-modal-message scan-modal-message--notice">
            <FontAwesomeIcon icon={meta.notice.icon} fixedWidth />
            <span>{meta.notice.text}</span>
          </p>
        )}

        {renderActions()}
      </div>
    </div>
  );
}

ScanStatusModal.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    asset_id: PropTypes.string,
    description: PropTypes.string,
    serial_number: PropTypes.string,
    category: PropTypes.string,
    custodian: PropTypes.string,
    room: PropTypes.string,
    room_name: PropTypes.string,
    registered_room: PropTypes.string,
    found_room: PropTypes.string,
    audited_at: PropTypes.string,
    audit_status: PropTypes.string,
    report_no: PropTypes.string,
  }),
  status: PropTypes.oneOf([
    "loading",
    "success",
    "duplicate",
    "condemned",
    "error",
    "discrepancy_added",
  ]).isRequired,
  errorMessage: PropTypes.string,
  onAddDiscrepancy: PropTypes.func,
  addingDiscrepancy: PropTypes.bool,
  onReport: PropTypes.func,
  onClose: PropTypes.func,
};

export default ScanStatusModal;
