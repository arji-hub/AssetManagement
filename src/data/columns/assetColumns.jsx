import { Status } from "../../components/ui/status/assetStatus";
import { formatDate } from "../../utils/date";

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
