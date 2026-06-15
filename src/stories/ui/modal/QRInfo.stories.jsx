import { useState } from "react";
import QRInfo from "../../../components/ui/modal/QRInfo";

export default {
  title: "Modal/QRInfo",
  component: QRInfo,
  parameters: {
    layout: "fullscreen",
  },
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
    isOpen: false,
    asset: sampleAsset,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.isOpen);

    return (
      <>
        <QRInfo {...args} isOpen={open} onClose={() => setOpen(false)} />
      </>
    );
  },
};

export const ForRepair = {
  args: {
    isOpen: false,
    asset: {
      ...sampleAsset,
      status: "For Repair",
      remarks: "Power supply unit needs replacement.",
    },
  },
  render: Default.render,
};

export const NoImage = {
  args: {
    isOpen: false,
    asset: {
      ...sampleAsset,
      asset_image_url: null,
      status: "For Disposal",
      remarks: null,
    },
  },
  render: Default.render,
};

export const Unavailable = {
  args: {
    isOpen: false,
    asset: null,
  },
  render: Default.render,
};