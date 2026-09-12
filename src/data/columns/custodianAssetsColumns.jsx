import { Status } from "../../components/ui/status/assetStatus";

export const custodianAssetsColumns = [
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
    key: "room",
    label: "Room",
    width: "1.2fr",
    priority: "medium",
    render: (a) => a.room_name,
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
    key: "qty",
    label: "Qty",
    width: "0.6fr",
    priority: "low",
    render: (a) => a.qty ?? 1,
    card: { icon: "fa-solid fa-boxes-stacked" },
  },
];
