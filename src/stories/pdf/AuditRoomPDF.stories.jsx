// src/pdf/templates/AuditRoomPDF.stories.jsx
import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { AuditRoomPDF } from "../../pdf/templates/AuditRoomPDF";

// ── Mock data ─────────────────────────────────────────────
const mockAuditRoom = {
  audit_no: "AR-2026-0042",
  room_id: "room-204",
  status: "Completed",
  audited_by: "uid-001",
  audited_by_name: "Juan Dela Cruz",
  total_assets: 5,
  audited_count: 5,
  discrepancy_count: 1,
  has_discrepancies: true,
  created_at: "2026-07-10T08:00:00.000Z",
  completed_at: "2026-07-10T09:30:00.000Z",
};

const mockItems = [
  {
    asset_id: "cict-1001",
    description: "Dell Latitude 5420",
    serial_number: "DL5420-889201",
    category: "Laptop",
    custodian: "Juan Dela Cruz",
    asset_status: "working",
    audit_status: "found",
  },
  {
    asset_id: "cict-1002",
    description: "HP LaserJet Pro M404",
    serial_number: "HPLJ-440921",
    category: "Printer",
    custodian: "Maria Santos",
    asset_status: "damaged",
    audit_status: "found",
  },
  {
    asset_id: "cict-1003",
    description: "Logitech MX Master 3",
    serial_number: "LGM3-201938",
    category: "Peripheral",
    custodian: "Juan Dela Cruz",
    asset_status: "working",
    audit_status: "found",
  },
  {
    asset_id: "cict-1004",
    description: 'Samsung 27" Monitor',
    serial_number: "SM27-773410",
    category: "Monitor",
    custodian: "Pedro Reyes",
    asset_status: "missing",
    audit_status: "missing",
  },
  {
    asset_id: "cict-1005",
    description: "Cisco Catalyst Switch",
    serial_number: "CSW-119284",
    category: "Networking",
    custodian: "Juan Dela Cruz",
    asset_status: "working",
    audit_status: "found",
  },
];

function makeLargeItemList(count) {
  const statuses = [
    "found",
    "found",
    "found",
    "missing",
    "misplaced",
    "unexpected",
  ];
  return Array.from({ length: count }, (_, i) => ({
    asset_id: `cict-${1000 + i}`,
    description: `Asset Item ${i + 1}`,
    serial_number: `SN-${100000 + i}`,
    category: ["Laptop", "Monitor", "Printer", "Networking"][i % 4],
    custodian: ["Juan Dela Cruz", "Maria Santos", "Pedro Reyes"][i % 3],
    asset_status: ["working", "damaged", "missing", "for_repair"][i % 4],
    audit_status: statuses[i % statuses.length],
  }));
}

// ── Wrapper so every story renders inside a live PDFViewer ──
function PDFPreview(args) {
  return (
    <PDFViewer width="100%" height={800} showToolbar={false}>
      <AuditRoomPDF {...args} />
    </PDFViewer>
  );
}

// ── Storybook config ─────────────────────────────────────
export default {
  title: "PDF/AuditRoomPDF",
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
    auditRoom: mockAuditRoom,
    items: mockItems,
  },
};

export const InProgressNoDiscrepancies = {
  args: {
    roomName: "Room 204",
    auditRoom: {
      ...mockAuditRoom,
      status: "Ongoing",
      audited_count: 3,
      discrepancy_count: 0,
      has_discrepancies: false,
      completed_at: null,
    },
    items: mockItems.map((item, i) =>
      i < 3 ? item : { ...item, audit_status: "not_audited" },
    ),
  },
};

export const CompletedNoDiscrepancies = {
  args: {
    roomName: "Server Room",
    auditRoom: {
      ...mockAuditRoom,
      status: "Completed",
      discrepancy_count: 0,
      has_discrepancies: false,
    },
    items: mockItems.map((item) => ({ ...item, audit_status: "found" })),
  },
};

export const CompletedWithDiscrepancies = {
  args: {
    roomName: "IT Department",
    auditRoom: {
      ...mockAuditRoom,
      status: "Completed",
      discrepancy_count: 3,
      has_discrepancies: true,
    },
    items: [
      { ...mockItems[0], audit_status: "found" },
      { ...mockItems[1], audit_status: "missing" },
      { ...mockItems[2], audit_status: "misplaced" },
      { ...mockItems[3], audit_status: "unexpected" },
      { ...mockItems[4], audit_status: "found" },
    ],
  },
};

export const EmptyRoom = {
  args: {
    roomName: "Storage B",
    auditRoom: {
      ...mockAuditRoom,
      total_assets: 0,
      audited_count: 0,
      discrepancy_count: 0,
      has_discrepancies: false,
    },
    items: [],
  },
};

export const SingleAsset = {
  args: {
    roomName: "Server Room",
    auditRoom: {
      ...mockAuditRoom,
      total_assets: 1,
      audited_count: 1,
      discrepancy_count: 0,
      has_discrepancies: false,
    },
    items: [mockItems[0]],
  },
};

export const LargeItemList = {
  args: {
    roomName: "Main Warehouse",
    auditRoom: {
      ...mockAuditRoom,
      total_assets: 40,
      audited_count: 40,
      discrepancy_count: 6,
      has_discrepancies: true,
    },
    items: makeLargeItemList(40),
  },
};
