import { Status } from "../components/ui/status/assetStatus";
import { formatDate } from "../utils/date";

export const roomColumns = [
  {
    key: "name",
    label: "Asset Name",
    width: "2.2fr",
    priority: "high",
    render: (a) => a.description,
  },
  {
    key: "category",
    label: "Category",
    width: "1fr",
    priority: "medium",
    render: (a) => a.category,
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "custodian",
    label: "Custodian",
    width: "1.5fr",
    priority: "high",
    render: (a) => a.name,
    card: { icon: "fa-solid fa-user" },
  },
  {
    key: "status",
    label: "Status",
    width: "1fr",
    priority: "high",
    render: (a) => <Status status={a.status} />,
  },
  {
    key: "date",
    label: "Date Assigned",
    width: "1.2fr",
    priority: "low",
    render: (a) => formatDate(a.date),
  },
];

export const custodianColumns = [
  {
    key: "name",
    label: "Asset Name",
    width: "2.2fr",
    priority: "high",
    render: (a) => a.description,
  },
  {
    key: "category",
    label: "Category",
    width: "1fr",
    priority: "medium",
    render: (a) => a.category_id,
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "room",
    label: "Room",
    width: "1.2fr",
    priority: "medium",
    render: (a) => a.room_id,
    card: { icon: "fa-solid fa-door-open" },
  },
  {
    key: "status",
    label: "Status",
    width: "1fr",
    priority: "high",
    render: (a) => <Status status={a.status} />,
  },
  {
    key: "date",
    label: "Date Assigned",
    width: "1.2fr",
    priority: "low",
    render: (a) => formatDate(a.created_at),
  },
];

export const assetColumns = [
  {
    key: "id",
    label: "Asset ID",
    width: "0.9fr",
    priority: "high",
    render: (a) => a.id || "—",
    card: { role: "hidden" },
  },
  {
    key: "desc",
    label: "Description",
    width: "2.5fr",
    priority: "high",
    render: (a) => a.description || "—",
  },
  {
    key: "category",
    label: "Category",
    width: "1fr",
    priority: "medium",
    render: (a) => a.category_id || "—",
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "location",
    label: "Location",
    width: "1fr",
    priority: "medium",
    render: (a) => a.room_id || "—",
    card: { icon: "fa-solid fa-door-open" },
  },
  {
    key: "qty",
    label: "Qty",
    width: "0.6fr",
    priority: "low",
    render: (a) => a.qty ?? 1,
    card: { icon: "fa-solid fa-boxes-stacked" },
  },
  {
    key: "value",
    label: "Unit Value",
    width: "1fr",
    priority: "low",
    render: (a) => `₱${a.unit_value?.toLocaleString() ?? "—"}`,
    card: { icon: "fa-solid fa-peso-sign" },
  },
  {
    key: "status",
    label: "Status",
    width: "1fr",
    priority: "high",
    render: (a) => <Status status={a.status} />,
  },
  {
    key: "date",
    label: "Date Acquired",
    width: "1.2fr",
    priority: "low",
    render: (a) => formatDate(a.date_acquired),
  },
];
