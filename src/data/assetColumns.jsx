import { Status } from "../components/ui/status/assetStatus";
import { formatDate } from "../utils/date";

export const roomColumns = [
  {
    key: "index",
    label: "#",
    priority: "high",
    render: (_, i) => i + 1,
    card: { role: "hidden" },
  },
  {
    key: "name",
    label: "Asset Name",
    priority: "high",
    render: (a) => a.description,
  },
  {
    key: "category",
    label: "Category",
    priority: "medium",
    render: (a) => a.category,
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "custodian",
    label: "Custodian",
    priority: "high",
    render: (a) => a.name,
    card: { icon: "fa-solid fa-user" },
  },
  {
    key: "status",
    label: "Status",
    priority: "high",
    render: (a) => <Status status={a.status} />,
  },
  {
    key: "date",
    label: "Date Assigned",
    priority: "low",
    render: (a) => formatDate(a.date),
  },
];

export const custodianColumns = [
  {
    key: "index",
    label: "#",
    priority: "high",
    render: (_, i) => i + 1,
    card: { role: "hidden" },
  },
  {
    key: "name",
    label: "Asset Name",
    priority: "high",
    render: (a) => a.description,
  },
  {
    key: "category",
    label: "Category",
    priority: "medium",
    render: (a) => a.category_id,
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "room",
    label: "Room",
    priority: "medium",
    render: (a) => a.room_id,
    card: { icon: "fa-solid fa-door-open" },
  },
  {
    key: "status",
    label: "Status",
    priority: "high",
    render: (a) => <Status status={a.status} />,
  },
  {
    key: "date",
    label: "Date Assigned",
    priority: "low",
    render: (a) => formatDate(a.created_at),
  },
];

export const assetColumns = [
  {
    key: "id",
    label: "Asset ID",
    priority: "high",
    render: (a) => a.id || "—",
    card: { role: "hidden" }, // ← add this
  },
  {
    key: "desc",
    label: "Description",
    priority: "high",
    render: (a) => a.description || "—",
    // no card role needed — will now correctly become titleCol
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
    card: { icon: "fa-solid fa-boxes-stacked" },
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
