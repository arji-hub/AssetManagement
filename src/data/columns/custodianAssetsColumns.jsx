import { Status } from "../../components/ui/status/assetStatus";
import { formatDate } from "../../utils/date";

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
    render: (a) => a.category_id,
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
    key: "date",
    label: "Date Assigned",
    width: "1.2fr",
    priority: "low",
    render: (a) => formatDate(a.created_at),
  },
];
