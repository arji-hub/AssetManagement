// src/pdf/templates/RoomInventoryPDF.stories.jsx
import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { RoomInventoryPDF } from "../../pdf/templates/RoomInventoryPDF";

// ── Mock data ─────────────────────────────────────────────
const mockAssets = [
  {
    id: "1",
    description: "Dell Latitude 5420",
    category: "Laptop",
    name: "Juan Dela Cruz",
    status: "working",
    date: "2026-01-15",
  },
  {
    id: "2",
    description: "HP LaserJet Pro M404",
    category: "Printer",
    name: "Maria Santos",
    status: "damaged",
    date: "2026-02-03",
  },
  {
    id: "3",
    description: "Logitech MX Master 3",
    category: "Peripheral",
    name: "Juan Dela Cruz",
    status: "working",
    date: "2026-01-15",
  },
  {
    id: "4",
    description: 'Samsung 27" Monitor',
    category: "Monitor",
    name: "Pedro Reyes",
    status: "missing",
    date: "2025-11-20",
  },
  {
    id: "5",
    description: "Cisco Catalyst Switch",
    category: "Networking",
    name: "IT Room",
    status: "for_repair",
    date: "2025-09-10",
  },
];

function makeLargeAssetList(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    description: `Asset Item ${i + 1}`,
    category: ["Laptop", "Monitor", "Printer", "Networking"][i % 4],
    name: ["Juan Dela Cruz", "Maria Santos", "Pedro Reyes"][i % 3],
    status: ["working", "damaged", "missing", "for_repair"][i % 4],
    date: "2026-01-15",
  }));
}

// ── Wrapper so every story renders inside a live PDFViewer ──
function PDFPreview(args) {
  return (
    <PDFViewer width="100%" height={800} showToolbar={false}>
      <RoomInventoryPDF {...args} />
    </PDFViewer>
  );
}

// ── Storybook config ─────────────────────────────────────
export default {
  title: "PDF/RoomInventoryPDF",
  component: PDFPreview,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    roomName: { control: "text" },
  },
};

// ── Stories ───────────────────────────────────────────────
export const Default = {
  args: {
    roomName: "Room 204",
    assets: mockAssets,
  },
};

export const EmptyRoom = {
  args: {
    roomName: "Storage B",
    assets: [],
  },
};

export const SingleAsset = {
  args: {
    roomName: "Server Room",
    assets: [mockAssets[0]],
  },
};

export const LargeAssetList = {
  args: {
    roomName: "Main Warehouse",
    assets: makeLargeAssetList(40),
  },
};

export const MixedStatuses = {
  args: {
    roomName: "IT Department",
    assets: [
      {
        id: "1",
        description: "Working Unit",
        category: "Laptop",
        name: "Juan Dela Cruz",
        status: "working",
        date: "2026-01-15",
      },
      {
        id: "2",
        description: "Damaged Unit",
        category: "Printer",
        name: "Maria Santos",
        status: "damaged",
        date: "2026-02-03",
      },
      {
        id: "3",
        description: "Missing Unit",
        category: "Monitor",
        name: "Pedro Reyes",
        status: "missing",
        date: "2025-11-20",
      },
      {
        id: "4",
        description: "For Repair Unit",
        category: "Networking",
        name: "IT Room",
        status: "for_repair",
        date: "2025-09-10",
      },
    ],
  },
};
