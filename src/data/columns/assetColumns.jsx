import { Status } from "../../components/ui/status/assetStatus";

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
];