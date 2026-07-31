import React from "react";
import { MemoryRouter } from "react-router-dom";
import AssetTable from "../../components/panel/AssetTable";
import { Status } from "../../components/ui/status/assetStatus";
import { formatDate } from "../../utils/date";

/* ── Mock data: 30 assets ── */
const categories = [
  "Laptop",
  "Projector",
  "Desk",
  "Chair",
  "Printer",
  "Monitor",
  "Aircon",
  "Whiteboard",
];
const rooms = [
  "Comp Lab 402",
  "Admin Office 12",
  "Physics Lab B",
  "Main Library",
  "Room 301",
  "Faculty Lounge",
];
const custodians = [
  "Dr. Elena Smith",
  "Marcus Thorne",
  "Sarah Connor",
  "James Rivera",
  "Anna Cruz",
  "Mark Diaz",
];
const statuses = ["working", "damaged", "missing", "for_repair", "condemned"];

function makeMockAsset(i) {
  const n = i + 1;
  const category = categories[i % categories.length];
  const room = rooms[i % rooms.length];
  const custodian = custodians[i % custodians.length];
  const status = statuses[i % statuses.length];
  const day = (i % 28) + 1;

  return {
    id: `cict-${String(1000 + n)}`,
    description: `${category} Unit ${n}`,
    category,
    category_id: category,
    room_id: room,
    name: custodian,
    qty: (i % 3) + 1,
    unit_value: 5000 + i * 1234,
    status,
    date: `2024-0${(i % 9) + 1}-${String(day).padStart(2, "0")}`,
    date_acquired: `2023-1${(i % 2) + 1}-${String(day).padStart(2, "0")}`,
    created_at: `2024-0${(i % 9) + 1}-${String(day).padStart(2, "0")}`,
  };
}

const mockAssets = Array.from({ length: 30 }, (_, i) => makeMockAsset(i));

/* ── Column config (mirrors the global asset list from the page) ── */
const columns = [
  {
    key: "id",
    label: "Asset ID",
    priority: "high",
    render: (a) => a.id || "—",
  },
  {
    key: "desc",
    label: "Description",
    priority: "high",
    render: (a) => a.description || "—",
  },
  {
    key: "category",
    label: "Category",
    priority: "medium",
    render: (a) => a.category_id || "—",
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "location",
    label: "Location",
    priority: "medium",
    render: (a) => a.room_id || "—",
    card: { icon: "fa-solid fa-door-open" },
  },
  {
    key: "qty",
    label: "Qty",
    priority: "low",
    render: (a) => a.qty ?? 1,
    card: { icon: "fa-solid fa-cubes" },
  },
  {
    key: "value",
    label: "Unit Value",
    priority: "low",
    render: (a) => `₱${a.unit_value?.toLocaleString() ?? "—"}`,
    card: { icon: "fa-solid fa-peso-sign" },
  },
  {
    key: "status",
    label: "Status",
    priority: "high",
    render: (a) => <Status status={a.status} />,
  },
  {
    key: "date",
    label: "Date Acquired",
    priority: "low",
    render: (a) => formatDate(a.date_acquired),
  },
];

export default {
  title: "Panel/AssetTable",
  component: AssetTable,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

/* ── Default: 30 assets, paginated 20/page desktop, 10/page mobile ── */
export const Default = {
  args: {
    columns,
    data: mockAssets,
    loading: false,
    error: null,
    emptyMessage: "No assets found.",
    onRowAction: (asset) => alert(`Open asset ${asset.id}`),
  },
};

/* ── Fewer assets than one page — pagination controls should still render but stay on page 1 ── */
export const FewAssets = {
  args: {
    ...Default.args,
    data: mockAssets.slice(0, 6),
  },
};

/* ── Exactly one full page — "next" should be disabled ── */
export const ExactlyOnePage = {
  args: {
    ...Default.args,
    data: mockAssets.slice(0, 20),
  },
};

/* ── Loading state ── */
export const Loading = {
  args: {
    ...Default.args,
    data: [],
    loading: true,
  },
};

/* ── Error state ── */
export const ErrorState = {
  args: {
    ...Default.args,
    data: [],
    loading: false,
    error: "Failed to load assets. Please try again.",
  },
};

/* ── Empty state (loaded successfully, zero results) ── */
export const Empty = {
  args: {
    ...Default.args,
    data: [],
    loading: false,
    error: null,
    emptyMessage: "No assets found.",
  },
};

/* ── Mobile card view — forces a narrow viewport via Storybook viewport addon ── */
export const MobileView = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

/* ── Custom page size override (5 per page desktop, 3 per page mobile) ── */
export const CustomPageSize = {
  args: {
    ...Default.args,
    desktopPageSize: 5,
    mobilePageSize: 3,
  },
};
