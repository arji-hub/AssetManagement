import { useState } from "react";
import ReportModal from "../../../components/ui/modal/ReportModal";
import * as assetService from "../../../services/asset";

const MOCK_ASSET = {
  id: "cict-I001",
  description: "Epson printer Dot Matrix",
  category_id: "Printer",
  room_id: "SDL1",
  property_custodian_name: "Ralph Jasper Ortiz",
};

export default {
  title: "Modal/ReportModal",
  component: ReportModal,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onClose: { action: "closed" },
    onSubmit: { action: "submitted" },
  },
};

// ── Default: empty form, nothing fetched yet ──
export const Default = {
  args: {
    isSubmitting: false,
  },
};

// ── Submitting state: buttons disabled, "Submitting..." label ──
export const Submitting = {
  args: {
    isSubmitting: true,
  },
};

// ── Asset found: mocks fetchAssetByID to resolve with a result ──
// Type anything into Asset ID and click the find button to see this resolve.
export const WithMockedAssetLookup = {
  render: (args) => {
    assetService.fetchAssetByID = async (id) => {
      await new Promise((res) => setTimeout(res, 400)); // simulate latency
      return { ...MOCK_ASSET, id };
    };
    return <ReportModal {...args} />;
  },
  args: {
    isSubmitting: false,
  },
};

// ── Asset not found: mocks fetchAssetByID throwing, matching real behavior ──
export const AssetNotFound = {
  render: (args) => {
    assetService.fetchAssetByID = async (id) => {
      await new Promise((res) => setTimeout(res, 400));
      throw new Error(`Asset with ID "${id}" not found.`);
    };
    return <ReportModal {...args} />;
  },
  args: {
    isSubmitting: false,
  },
};

// ── Asset lookup throws an unrelated/network error ──
export const AssetLookupError = {
  render: (args) => {
    assetService.fetchAssetByID = async () => {
      await new Promise((res) => setTimeout(res, 400));
      throw new Error("Network error — please try again.");
    };
    return <ReportModal {...args} />;
  },
  args: {
    isSubmitting: false,
  },
};

// ── Interactive wrapper: lets you actually open/close the modal in canvas ──
function InteractiveWrapper(args) {
  const [open, setOpen] = useState(true);

  assetService.fetchAssetByID = async (id) => {
    await new Promise((res) => setTimeout(res, 400));
    return { ...MOCK_ASSET, id };
  };

  if (!open) {
    return <button onClick={() => setOpen(true)}>Reopen Modal</button>;
  }

  return (
    <ReportModal
      {...args}
      onClose={() => setOpen(false)}
      onSubmit={(data) => {
        console.log("Submitted report:", data);
        setOpen(false);
      }}
    />
  );
}

export const Interactive = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    isSubmitting: false,
  },
};
