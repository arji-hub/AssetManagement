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
      options: ["loading", "success", "error"],
      description: "Current state of the modal",
    },
    errorMessage: {
      control: "text",
      description: "Error message shown when status is error",
    },
    onClose: {
      action: "onClose",
      description: "Called when the user clicks Continue Scanning or Retry",
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

export const ErrorAlreadyAudited = {
  name: "Error – Already Audited",
  args: {
    item: minimalItem,
    status: "error",
    errorMessage: "This asset has already been audited in this session.",
  },
};
