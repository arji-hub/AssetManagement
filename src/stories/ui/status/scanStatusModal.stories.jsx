import scanStatusModal from "../../../components/ui/status/scanStatusModal";

export default {
  title: "Status/ScanStatusModal",
  component: scanStatusModal,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    item: {
      control: "object",
      description: "The audit item being scanned/verified",
    },
    status: {
      control: "select",
      options: [
        "loading",
        "success",
        "duplicate",
        "error",
        "discrepancy_added",
      ],
      description: "Current state of the modal",
    },
    errorMessage: {
      control: "text",
      description:
        'Error message shown when status is error. Pass "not_found." to trigger the "Asset Not In Audit" flag-as-discrepancy flow.',
    },
    onClose: {
      action: "onClose",
      description:
        "Called when the user clicks Continue Scanning / Retry / Dismiss",
    },
    onAddDiscrepancy: {
      action: "onAddDiscrepancy",
      description: "Called when the user clicks Flag as Unexpected",
    },
    addingDiscrepancy: {
      control: "boolean",
      description:
        "Shows a spinner on the Flag as Unexpected button while true",
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// SHARED MOCK ITEMS
// ══════════════════════════════════════════════════════════════════════════════

const fullItem = {
  id: "cict-1010",
  asset_id: "cict-1010",
  description: "Dell OptiPlex 7090 Desktop",
  category: "Computer Unit",
  custodian: "Juan Dela Cruz",
};

const minimalItem = {
  id: "cict-2044",
  asset_id: "cict-2044",
};

const notFoundItem = {
  id: "cict-9999",
  asset_id: "cict-9999",
};

const alreadyAuditedItem = {
  id: "cict-1010",
  asset_id: "cict-1010",
  description: "Dell OptiPlex 7090 Desktop",
  audit_status: "audited",
  audited_at: "2026-07-20T09:30:00.000Z",
};

const alreadyFlaggedItem = {
  id: "cict-9999",
  asset_id: "cict-9999",
  description: "HP LaserJet Printer",
  audit_status: "unexpected",
  audited_at: "2026-07-21T14:15:00.000Z",
};

// ══════════════════════════════════════════════════════════════════════════════
// LOADING
// ══════════════════════════════════════════════════════════════════════════════

export const LoadingFullDetails = {
  name: "Loading – Full Details",
  args: {
    item: fullItem,
    status: "loading",
  },
};

export const LoadingMinimalDetails = {
  name: "Loading – Minimal Details",
  args: {
    item: minimalItem,
    status: "loading",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// SUCCESS
// ══════════════════════════════════════════════════════════════════════════════

export const SuccessFullDetails = {
  name: "Success – Full Details",
  args: {
    item: fullItem,
    status: "success",
  },
};

export const SuccessMinimalDetails = {
  name: "Success – Minimal Details",
  args: {
    item: minimalItem,
    status: "success",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// DUPLICATE
// ══════════════════════════════════════════════════════════════════════════════

export const DuplicateAlreadyAudited = {
  name: "Duplicate – Already Audited",
  args: {
    item: alreadyAuditedItem,
    status: "duplicate",
  },
};

export const DuplicateAlreadyFlagged = {
  name: "Duplicate – Already Flagged as Discrepancy",
  args: {
    item: alreadyFlaggedItem,
    status: "duplicate",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// ERROR
// ══════════════════════════════════════════════════════════════════════════════

export const ErrorDefaultMessage = {
  name: "Error – Default Message",
  args: {
    item: fullItem,
    status: "error",
  },
};

export const ErrorNetworkFailure = {
  name: "Error – Network Failure",
  args: {
    item: fullItem,
    status: "error",
    errorMessage: "Network error while saving to Firestore. Please try again.",
  },
};

export const ErrorNotFoundInAudit = {
  name: "Error – Not Found In Audit (shows Flag button)",
  args: {
    item: notFoundItem,
    status: "error",
    errorMessage: "not_found.",
  },
};

export const ErrorNotFoundAddingDiscrepancy = {
  name: "Error – Not Found, Flag button loading",
  args: {
    item: notFoundItem,
    status: "error",
    errorMessage: "not_found.",
    addingDiscrepancy: true,
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// DISCREPANCY ADDED
// ══════════════════════════════════════════════════════════════════════════════

export const DiscrepancyAdded = {
  name: "Discrepancy Recorded",
  args: {
    item: notFoundItem,
    status: "discrepancy_added",
  },
};
