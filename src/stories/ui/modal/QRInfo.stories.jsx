import { MemoryRouter } from "react-router-dom";
import QRInfo from "../../../components/ui/modal/QRInfo";

export default {
  title: "Modal/QRInfo",
  component: QRInfo,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

const sampleAsset = {
  serial_number: "SN-2024-00231",
  category_id: "Computer",
  description: "Dell OptiPlex 7090 Desktop Computer",
  date_acquired: "2024-03-15",
  unit_value: 45000,
  qty: 1,
  status: "Working",
  remarks: "Assigned to Faculty Room A, includes monitor and keyboard.",
  asset_image_url:
    "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&h=400&fit=crop",
  property_custodian: "Juan Dela Cruz",
  local_mr: "Maria Santos",
  room_id: "CICT-201",
};

export const Default = {
  args: {
    asset: sampleAsset,
  },
};

export const ForRepair = {
  args: {
    asset: {
      ...sampleAsset,
      status: "For Repair",
      remarks: "Power supply unit needs replacement.",
    },
  },
};

export const Damaged = {
  args: {
    asset: {
      ...sampleAsset,
      status: "Damaged",
      remarks: "Screen cracked, needs assessment for repair or disposal.",
    },
  },
};

export const Condemned = {
  args: {
    asset: {
      ...sampleAsset,
      asset_image_url: null,
      status: "Condemned",
      remarks: null,
    },
  },
};

export const Missing = {
  args: {
    asset: {
      ...sampleAsset,
      asset_image_url: null,
      status: "Missing",
      remarks: "Last seen during Q1 inventory check.",
    },
  },
};

export const Unavailable = {
  args: {
    asset: null,
  },
};
