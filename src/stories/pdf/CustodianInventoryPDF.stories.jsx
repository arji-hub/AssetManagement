// src/pdf/templates/CustodianInventoryPDF.stories.jsx
import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { CustodianInventoryPDF } from "../../pdf/templates/CustodianInventoryPDF";

// ── Mock data ─────────────────────────────────────────────
const mockAssets = [
  {
    id: "1",
    description: "Dell Latitude 5420",
    category_id: "Laptop",
    room_id: "CT7",
    status: "working",
    created_at: "2026-01-15",
  },
  {
    id: "2",
    description: "HP LaserJet Pro M404",
    category_id: "Printer",
    room_id: "CT5",
    status: "damaged",
    created_at: "2026-02-03",
  },
  {
    id: "3",
    description: "Logitech MX Master 3",
    category_id: "Peripheral",
    room_id: "CT7",
    status: "working",
    created_at: "2026-01-15",
  },
  {
    id: "4",
    description: 'Samsung 27" Monitor',
    category_id: "Monitor",
    room_id: "CT3",
    status: "missing",
    created_at: "2025-11-20",
  },
  {
    id: "5",
    description: "Cisco Catalyst Switch",
    category_id: "Networking",
    room_id: "Server Room",
    status: "for_repair",
    created_at: "2025-09-10",
  },
];

function makeLargeAssetList(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    description: `Asset Item ${i + 1}`,
    category_id: ["Laptop", "Monitor", "Printer", "Networking"][i % 4],
    room_id: ["CT1", "CT2", "CT3", "Server Room"][i % 4],
    status: ["working", "damaged", "missing", "for_repair"][i % 4],
    created_at: "2026-01-15",
  }));
}

// ── Wrapper so every story renders inside a live PDFViewer ──
function PDFPreview(args) {
  return (
    <PDFViewer width="100%" height={800} showToolbar={false}>
      <CustodianInventoryPDF {...args} />
    </PDFViewer>
  );
}

// ── Storybook config ─────────────────────────────────────
export default {
  title: "PDF/CustodianInventoryPDF",
  component: PDFPreview,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    custodianName: { control: "text" },
  },
};

// ── Stories ───────────────────────────────────────────────
export const Default = {
  args: {
    custodianName: "Juan Dela Cruz",
    assets: mockAssets,
  },
};

export const NoAssets = {
  args: {
    custodianName: "Maria Santos",
    assets: [],
  },
};

export const SingleAsset = {
  args: {
    custodianName: "Pedro Reyes",
    assets: [mockAssets[0]],
  },
};

export const LargeAssetList = {
  args: {
    custodianName: "Gariel Galang",
    assets: makeLargeAssetList(40),
  },
};

export const MixedStatuses = {
  args: {
    custodianName: "Khenit Gonzales",
    assets: [
      {
        id: "1",
        description: "Working Unit",
        category_id: "Laptop",
        room_id: "CT7",
        status: "working",
        created_at: "2026-01-15",
      },
      {
        id: "2",
        description: "Damaged Unit",
        category_id: "Printer",
        room_id: "CT5",
        status: "damaged",
        created_at: "2026-02-03",
      },
      {
        id: "3",
        description: "Missing Unit",
        category_id: "Monitor",
        room_id: "CT3",
        status: "missing",
        created_at: "2025-11-20",
      },
      {
        id: "4",
        description: "For Repair Unit",
        category_id: "Networking",
        room_id: "Server Room",
        status: "for_repair",
        created_at: "2025-09-10",
      },
    ],
  },
};
