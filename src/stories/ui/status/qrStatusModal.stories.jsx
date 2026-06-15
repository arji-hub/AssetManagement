import QRStatusModal from "../../../components/ui/status/QRStatusModal";

export default {
  title: "Status/QRStatusModal",
  component: QRStatusModal,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    status: {
      control: "select",
      options: ["loading", "success", "notfound", "error"],
      description: "Current state of the modal",
    },
    errorMessage: {
      control: "text",
      description: "Message shown when status is notfound or error",
    },
    onClose: {
      action: "onClose",
      description: "Called when the user clicks Try Again",
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// LOADING
// ══════════════════════════════════════════════════════════════════════════════

export const Loading = {
  name: "Loading – Scanning",
  args: {
    status: "loading",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// SUCCESS
// ══════════════════════════════════════════════════════════════════════════════

export const Success = {
  name: "Success – Asset Found",
  args: {
    status: "success",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// NOT FOUND
// ══════════════════════════════════════════════════════════════════════════════

export const NotFoundInvalidAsset = {
  name: "Not Found – Invalid Asset",
  args: {
    status: "notfound",
    errorMessage: "This QR code does not point to a valid asset.",
  },
};

export const NotFoundUnrecognizedFormat = {
  name: "Not Found – Unrecognized Format",
  args: {
    status: "notfound",
    errorMessage: "This QR code is not in a recognized format.",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// ERROR
// ══════════════════════════════════════════════════════════════════════════════

export const ErrorNoQRDetected = {
  name: "Error – No QR Detected",
  args: {
    status: "error",
    errorMessage: "Could not read a QR code from the selected image.",
  },
};

export const ErrorUnreadableImage = {
  name: "Error – Unreadable Image",
  args: {
    status: "error",
    errorMessage: "Failed to load image. Please try a different file.",
  },
};
