import AddingStatusModal from "../../../components/ui/status/AddingStatusModal";

export default {
  title: "Status/AddingStatusModal",
  component: AddingStatusModal,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    title: {
      control: "text",
      description: "The entity being added e.g. Custodian, Room, Asset",
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
      description: "Called when the user clicks Done or Try Again",
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// CUSTODIAN
// ══════════════════════════════════════════════════════════════════════════════

export const CustodianLoading = {
  name: "Custodian – Loading",
  args: {
    title: "Custodian",
    status: "loading",
  },
};

export const CustodianSuccess = {
  name: "Custodian – Success",
  args: {
    title: "Custodian",
    status: "success",
  },
};

export const CustodianErrorDuplicateEmail = {
  name: "Custodian – Error (Duplicate Email)",
  args: {
    title: "Custodian",
    status: "error",
    errorMessage: "The email address is already in use by another account.",
  },
};

export const CustodianErrorPermissionDenied = {
  name: "Custodian – Error (Permission Denied)",
  args: {
    title: "Custodian",
    status: "error",
    errorMessage: "Only admins can add custodians.",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// ROOM
// ══════════════════════════════════════════════════════════════════════════════

export const RoomLoading = {
  name: "Room – Loading",
  args: {
    title: "Room",
    status: "loading",
  },
};

export const RoomSuccess = {
  name: "Room – Success",
  args: {
    title: "Room",
    status: "success",
  },
};

export const RoomErrorDuplicateName = {
  name: "Room – Error (Duplicate Name)",
  args: {
    title: "Room",
    status: "error",
    errorMessage: "A room with that name already exists.",
  },
};

export const RoomErrorMissingFields = {
  name: "Room – Error (Missing Fields)",
  args: {
    title: "Room",
    status: "error",
    errorMessage: "Missing required fields: room name, building, floor.",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// ASSET
// ══════════════════════════════════════════════════════════════════════════════

export const AssetLoading = {
  name: "Asset – Loading",
  args: {
    title: "Asset",
    status: "loading",
  },
};

export const AssetSuccess = {
  name: "Asset – Success",
  args: {
    title: "Asset",
    status: "success",
  },
};

export const AssetErrorUploadFailed = {
  name: "Asset – Error (Upload Failed)",
  args: {
    title: "Asset",
    status: "error",
    errorMessage: "Failed to upload asset image. Please try again.",
  },
};

export const AssetErrorDuplicateId = {
  name: "Asset – Error (Duplicate ID)",
  args: {
    title: "Asset",
    status: "error",
    errorMessage: "An asset with ID cict-0001 already exists.",
  },
};
